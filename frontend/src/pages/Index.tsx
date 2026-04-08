import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import KanbanBoard from "@/components/KanbanBoard";
import KanbanSkeleton from "@/components/KanbanSkeleton";
import EmptyState from "@/components/EmptyState";
import AddApplicationModal from "@/components/AddApplicationModal";
import StatsBar from "@/components/StatsBar";
import SearchFilterBar from "@/components/SearchFilterBar";
import {
  Application,
  ColumnId,
  statusToColumnId,
  columnIdToStatus,
} from "@/types/application";
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from "@/api/applications.api";
import { toast } from "sonner";

// Transform backend document → UI Application shape
function toUIApplication(doc: any): Application {
  return {
    id: doc._id,
    company: doc.company,
    role: doc.role,
    dateApplied: doc.dateApplied
      ? new Date(doc.dateApplied).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Unknown",
    skills: doc.requiredSkills ?? [],
    location: doc.location,
    seniority: doc.seniority,
    columnId: statusToColumnId(doc.status ?? "applied"),
  };
}

const Index = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ColumnId | "all">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ─── Fetch applications ─────────────────────────────────────────────────────
  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data } = await getApplications();
      return (data as any[]).map(toUIApplication);
    },
  });

  // ─── Create application ──────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof createApplication>[0]) =>
      createApplication(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application added!");
    },
    onError: () => toast.error("Failed to add application."),
  });

  // ─── Update status (drag & drop) ─────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateApplication(id, { status }),
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.error("Failed to move card. Please try again.");
    },
  });

  // ─── Delete application ───────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteApplication(id),
    onMutate: (id) => setDeletingId(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Application[]>(["applications"], (prev) =>
        prev ? prev.filter((a) => a.id !== id) : []
      );
      toast.success("Application deleted.");
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.error("Failed to delete application.");
    },
    onSettled: () => setDeletingId(null),
  });

  // ─── Filtered applications (client-side) ────────────────────────────────────
  const filteredApplications = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return applications.filter((a) => {
      const matchesSearch =
        !q ||
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || a.columnId === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleAdd = useCallback(
    (
      data: Omit<Application, "id" | "columnId"> & {
        jobDescription?: string;
        niceToHaveSkills?: string[];
        resumeSuggestions?: string[];
      }
    ) => {
      createMutation.mutate({
        company: data.company,
        role: data.role,
        status: "Applied",
        location: data.location,
        seniority: data.seniority,
        jobDescription: data.jobDescription,
        requiredSkills: data.skills,
        niceToHaveSkills: data.niceToHaveSkills,
        resumeSuggestions: data.resumeSuggestions,
      });
    },
    [createMutation]
  );

  const handleMove = useCallback(
    (id: string, destination: ColumnId, _newIndex: number) => {
      queryClient.setQueryData<Application[]>(["applications"], (prev) => {
        if (!prev) return prev;
        return prev.map((a) =>
          a.id === id ? { ...a, columnId: destination } : a
        );
      });
      updateMutation.mutate({ id, status: columnIdToStatus(destination) });
    },
    [queryClient, updateMutation]
  );

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
  }, []);

  const hasActiveFilters =
    searchQuery.trim() !== "" || statusFilter !== "all";

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header onAddClick={() => setModalOpen(true)} />
        <main className="flex-1 overflow-hidden">
          <KanbanSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header onAddClick={() => setModalOpen(true)} />

      {/* Stats bar — always visible when there are applications */}
      {applications.length > 0 && (
        <StatsBar applications={applications} />
      )}

      {/* Search & filter bar — visible when there are applications */}
      {applications.length > 0 && (
        <SearchFilterBar
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          resultCount={filteredApplications.length}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onClearFilters={handleClearFilters}
        />
      )}

      {applications.length === 0 ? (
        <EmptyState onAddClick={() => setModalOpen(true)} />
      ) : filteredApplications.length === 0 && hasActiveFilters ? (
        /* No results from filter */
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-32">
          <p className="text-lg font-semibold text-foreground">No results found</p>
          <p className="text-sm text-muted-foreground">
            Try a different search or clear your filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <main className="flex-1 overflow-hidden">
          <KanbanBoard
            applications={filteredApplications}
            onMove={handleMove}
            onDelete={(id) => deleteMutation.mutate(id)}
            deletingId={deletingId}
            statusFilter={statusFilter}
          />
        </main>
      )}

      <AddApplicationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
        isPending={createMutation.isPending}
      />
    </div>
  );
};

export default Index;
