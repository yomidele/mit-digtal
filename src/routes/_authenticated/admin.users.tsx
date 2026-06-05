import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { assignRole, listUsersWithRoles, removeRole } from "@/lib/admin.functions";
import { TARABA_LGAS } from "@/lib/taraba-data";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersPage,
});

const ROLE_LABEL: Record<string, string> = {
  business_owner: "Business Owner",
  lga_moderator: "LGA Moderator",
  state_admin: "State Admin",
  super_admin: "Super Admin",
};
const ROLE_COLOR: Record<string, string> = {
  business_owner: "bg-secondary text-secondary-foreground",
  lga_moderator: "bg-warning/15 text-warning-foreground border border-warning/40",
  state_admin: "bg-primary/15 text-primary border border-primary/30",
  super_admin: "bg-gold/20 text-gold-foreground border border-gold/50",
};

function UsersPage() {
  const fetchUsers = useServerFn(listUsersWithRoles);
  const assignFn = useServerFn(assignRole);
  const removeFn = useServerFn(removeRole);
  const qc = useQueryClient();

  const { data: users, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => fetchUsers() });
  const [filter, setFilter] = useState("");
  const [dialog, setDialog] = useState<{ id: string; name: string } | null>(null);
  const [newRole, setNewRole] = useState<"lga_moderator" | "state_admin" | "super_admin">("lga_moderator");
  const [lga, setLga] = useState<string>("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-users"] });
  const assign = useMutation({
    mutationFn: (v: { user_id: string; role: typeof newRole; assigned_lga: string | null }) => assignFn({ data: v }),
    onSuccess: () => { toast.success("Role assigned"); setDialog(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (v: { user_id: string; role: string }) => removeFn({ data: v as { user_id: string; role: "business_owner" | "lga_moderator" | "state_admin" | "super_admin" } }),
    onSuccess: () => { toast.success("Role removed"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (users ?? []).filter((u) => !filter || u.full_name?.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by name…" className="max-w-sm" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Roles</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">No users yet.</td></tr>}
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{u.full_name || "(no name)"}</div>
                  <div className="text-xs text-muted-foreground">{u.phone}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(u.roles ?? []).map((r: string) => (
                      <span key={r} className="inline-flex items-center gap-1">
                        <Badge className={ROLE_COLOR[r] ?? ""}>{ROLE_LABEL[r] ?? r}</Badge>
                        {r !== "business_owner" && (
                          <button onClick={() => remove.mutate({ user_id: u.id, role: r })} className="text-destructive hover:text-destructive/70" title="Remove role"><Trash2 className="h-3 w-3" /></button>
                        )}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => { setDialog({ id: u.id, name: u.full_name }); setNewRole("lga_moderator"); setLga(""); }}>
                    <UserCog className="mr-1 h-3.5 w-3.5" />Assign role
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign role to {dialog?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as typeof newRole)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lga_moderator">LGA Moderator</SelectItem>
                  <SelectItem value="state_admin">State Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newRole === "lga_moderator" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assigned LGA</label>
                <Select value={lga} onValueChange={setLga}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select LGA" /></SelectTrigger>
                  <SelectContent>
                    {TARABA_LGAS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button
              disabled={assign.isPending || (newRole === "lga_moderator" && !lga)}
              className="bg-primary hover:bg-primary-deep"
              onClick={() => dialog && assign.mutate({ user_id: dialog.id, role: newRole, assigned_lga: newRole === "lga_moderator" ? lga : null })}
            ><Plus className="mr-1 h-3.5 w-3.5" />Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
