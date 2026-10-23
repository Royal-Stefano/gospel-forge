import {
  PublicationStatus,
  UserRole,
  Episode,
  AuditLog,
} from "@/types";

export interface StatusTransitionRequest {
  episodeId: string;
  fromStatus: PublicationStatus;
  toStatus: PublicationStatus;
  userId: string;
  userRole: UserRole;
  isAuthor: boolean;
  rejectionReason?: string;
}

export interface TransitionResult {
  allowed: boolean;
  error?: string;
  auditAction?: string;
}

/**
 * Enforces the strict Gospel Forge Publishing State Machine:
 * Draft -> Submitted -> In Review -> Approved -> Published
 * (Also handles Rejected, Archived, Scheduled)
 */
export function validateStatusTransition(
  req: StatusTransitionRequest
): TransitionResult {
  const { fromStatus, toStatus, userRole, isAuthor } = req;
  const isAdmin = ["admin", "super_admin"].includes(userRole);

  // 1. Author transitions (Artists can only manage their own drafts and submissions)
  if (!isAdmin) {
    if (userRole === "listener") {
      return {
        allowed: false,
        error: "Forbidden: Listeners cannot create or modify episode publication states.",
      };
    }

    if (!isAuthor) {
      return {
        allowed: false,
        error: "Forbidden: You cannot modify another creator's episode.",
      };
    }

    // Artist moving draft -> submitted for review
    if (fromStatus === "draft" && toStatus === "submitted") {
      return {
        allowed: true,
        auditAction: "SUBMIT_FOR_REVIEW",
      };
    }

    // Artist reviving a rejected episode back to draft for edits
    if (fromStatus === "rejected" && toStatus === "draft") {
      return {
        allowed: true,
        auditAction: "REVIVE_DRAFT",
      };
    }

    // Artist attempting self-approval or publishing
    if (["approved", "published", "in_review", "archived"].includes(toStatus)) {
      return {
        allowed: false,
        error:
          "Publishing authorization required. Only Gospel Forge administrators can approve and publish episodes to the network.",
      };
    }

    return {
      allowed: false,
      error: `Invalid creator state transition from '${fromStatus}' to '${toStatus}'.`,
    };
  }

  // 2. Administrator transitions
  switch (fromStatus) {
    case "submitted":
      if (toStatus === "in_review" || toStatus === "approved" || toStatus === "rejected") {
        return {
          allowed: true,
          auditAction:
            toStatus === "approved"
              ? "APPROVE_SUBMISSION"
              : toStatus === "rejected"
              ? "REJECT_SUBMISSION"
              : "START_REVIEW",
        };
      }
      break;

    case "in_review":
      if (toStatus === "approved" || toStatus === "rejected") {
        return {
          allowed: true,
          auditAction:
            toStatus === "approved"
              ? "APPROVE_SUBMISSION"
              : "REJECT_SUBMISSION",
        };
      }
      break;

    case "approved":
      if (toStatus === "published" || toStatus === "scheduled" || toStatus === "archived") {
        return {
          allowed: true,
          auditAction:
            toStatus === "published"
              ? "PUBLISH_EPISODE"
              : toStatus === "scheduled"
              ? "SCHEDULE_EPISODE"
              : "ARCHIVE_EPISODE",
        };
      }
      break;

    case "draft":
      // Admins can fast-track drafts directly if needed
      if (["submitted", "in_review", "approved", "published", "scheduled"].includes(toStatus)) {
        return {
          allowed: true,
          auditAction: `ADMIN_OVERRIDE_${toStatus.toUpperCase()}`,
        };
      }
      break;

    case "published":
      if (toStatus === "archived") {
        return {
          allowed: true,
          auditAction: "ARCHIVE_EPISODE",
        };
      }
      break;

    case "scheduled":
      if (toStatus === "published" || toStatus === "approved") {
        return {
          allowed: true,
          auditAction: "PUBLISH_SCHEDULED",
        };
      }
      break;

    case "archived":
      if (toStatus === "published" || toStatus === "draft") {
        return {
          allowed: true,
          auditAction: "RESTORE_EPISODE",
        };
      }
      break;
  }

  return {
    allowed: false,
    error: `Unsupported state transition from '${fromStatus}' to '${toStatus}'.`,
  };
}
