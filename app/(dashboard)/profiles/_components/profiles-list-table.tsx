import { formatDistanceToNow } from "date-fns"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  buildProfileCoverageSummary,
  buildProfileRuleSummary,
  getProfileScopeLabel,
  getProfileStatus,
} from "@/lib/profiles/presentation"
import type { ProfileData, ProfilePreviewMap } from "@/lib/profiles/types"

import { ProfileActions } from "./profile-actions"

type ProfilesListTableProps = {
  profiles: ProfileData[]
  previewMap: ProfilePreviewMap
  busyProfileId: string | null
  onDuplicate: (profile: ProfileData) => void
  onDelete: (profile: ProfileData) => void
}

export function ProfilesListTable({
  profiles,
  previewMap,
  busyProfileId,
  onDuplicate,
  onDelete,
}: ProfilesListTableProps) {
  return (
    <div className="overflow-hidden rounded-sm border border-outline-variant/60 bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-outline-variant/60 bg-surface-subtle/40 hover:bg-surface-subtle/40">
            <TableHead className="px-4">Profile</TableHead>
            <TableHead className="px-4">Status</TableHead>
            <TableHead className="px-4">Coverage</TableHead>
            <TableHead className="px-4">Rules</TableHead>
            <TableHead className="px-4">Updated</TableHead>
            <TableHead className="px-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => {
            const preview = previewMap.get(profile.id)

            if (!preview) {
              return null
            }

            const status = getProfileStatus(preview)
            const rules = buildProfileRuleSummary(profile)

            return (
              <TableRow key={profile.id} className="border-outline-variant/60 hover:bg-surface-subtle/30">
                <TableCell className="px-4 py-4 align-top">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-on-surface">{profile.name}</p>
                      <Badge variant="outline">{getProfileScopeLabel(profile)}</Badge>
                    </div>
                    <p className="text-xs text-on-surface-variant/70">
                      {preview.totalDisplayedItems} visible items across this profile.
                    </p>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 align-top">
                  <div className="space-y-1">
                    <Badge variant={status.tone === "destructive" ? "destructive" : "default"}>
                      {status.label}
                    </Badge>
                    <p className="text-xs text-on-surface-variant/70">{status.helper}</p>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 align-top text-on-surface-variant">
                  {buildProfileCoverageSummary(preview)}
                </TableCell>
                <TableCell className="px-4 py-4 align-top">
                  {rules.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {rules.slice(0, 3).map((rule) => (
                        <Badge key={rule} variant="outline" className="border-outline-variant/70 bg-surface-subtle text-on-surface-variant">
                          {rule}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-on-surface-variant/70">No custom rules</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-4 align-top text-on-surface-variant">
                  {formatDistanceToNow(new Date(profile.updated_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="px-4 py-4 align-top text-right">
                  <div className="flex justify-end">
                    <ProfileActions
                      editHref={`/profiles/${profile.id}`}
                      editLabel="Open"
                      isBusy={busyProfileId === profile.id}
                      onDuplicate={() => onDuplicate(profile)}
                      onDelete={() => onDelete(profile)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
