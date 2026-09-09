import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateToDayMonYear } from '@/utils/formatDateToDayMonYear';
import { getInitials } from '@/utils/team-utils';
import { Check, X } from 'lucide-react';

interface JoinRequestViewModel {
  id: string;
  memberId: string;
  member: {
    fullName: string | null;
    avatar: string | null;
    firstName?: string | null;
    lastName?: string | null;
    id?: string;
  };
  requestedAt: string;
}

interface JoinRequestsProps {
  requests: JoinRequestViewModel[];
  onAccept: (req: JoinRequestViewModel) => void;
  onDecline: (req: JoinRequestViewModel) => void;
  page: number;
  total: number;
  totalPage: number;
  onPageChange: (page: number) => void;
}

function JoinRequests({
  requests,
  onAccept,
  onDecline,
  page,
  total,
  totalPage,
  onPageChange,
}: JoinRequestsProps) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between border-b px-5 py-3.5">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
          Join Requests
        </p>
        <Badge variant="destructive" className="text-[11px]">
          {total} pending
        </Badge>
      </div>

      <div className="divide-y">
        {requests.map((req) => (
          <div key={req.id} className="flex items-center gap-3 px-5 py-3">
            <Avatar className="size-9 shrink-0">
              {req.member.avatar && <AvatarImage src={req.member.avatar} />}
              <AvatarFallback className="border-primary/40 bg-primary/10 text-primary-soft-foreground border text-[11px] font-semibold">
                {getInitials(req.member.fullName)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{req.member.fullName}</p>
              <p className="text-muted-foreground text-xs">
                Requested {formatDateToDayMonYear(req.requestedAt)}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 h-7 text-xs"
                onClick={() => onDecline(req)}
              >
                <X size={11} className="mr-1" /> Decline
              </Button>
              <Button size="sm" className="h-7 text-xs" onClick={() => onAccept(req)}>
                <Check size={11} className="mr-1" /> Accept
              </Button>
            </div>
          </div>
        ))}
      </div>
      {totalPage > 1 && (
        <div className="flex items-center justify-between border-t px-5 py-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-xs">
            Page {page} of {totalPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPage}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default JoinRequests;
