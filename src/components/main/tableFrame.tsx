"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Domain } from "@/interfaces/domain";
import { cn } from "@/lib/utils";
import { BadgeCheck, BadgeX } from "lucide-react";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface TableFrameProps {
  data?: Domain[];
  isLoading: boolean;
  onEdit?: (d: Domain) => void;
  refetch: () => void;
}

async function handleDelete(d: Domain) {
  const res = await fetch(
    `https://domain-danajo.liara.run/api/Domain/${d.id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) throw new Error(`${d.domain} failed to delete`);
  return d;
}

export function TableFrame({
  data,
  isLoading,
  onEdit,
  refetch,
}: TableFrameProps) {
  const mutation = useMutation({
    mutationFn: handleDelete,
    onSuccess: (d) => {
      toast.success(`${d.domain} deleted successfully`);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error);
    },
  });

  if (isLoading) {
    return <p>is Loading...</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Domain</TableHead>
          <TableHead className="text-center w-32">Status</TableHead>
          <TableHead className="text-center">Active</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.domain}</TableCell>
            <TableCell className="text-center">
              <div
                className={cn(
                  "rounded-full px-2 py-1",
                  item.status === 1 && "bg-yellow-100 text-yellow-600",
                  item.status === 2 && "bg-green-100 text-green-600",
                  item.status === 3 && "bg-red-100 text-red-600"
                )}
              >
                {item.status === 1 && "Pending"}
                {item.status === 2 && "Verified"}
                {item.status === 3 && "Rejected"}
              </div>
            </TableCell>
            <TableCell className="flex justify-center">
              {item.isActive ? (
                <BadgeCheck className="text-green-500" />
              ) : (
                <BadgeX className="text-red-500" />
              )}
            </TableCell>
            <TableCell>{new Date(item.createdDate).toLocaleString()}</TableCell>
            <TableCell className="flex gap-2">
              <Button
                disabled={mutation.isPending}
                variant="ghost"
                onClick={() => onEdit?.(item)}
              >
                Edit
              </Button>
              <Button
                disabled={mutation.isPending}
                variant="destructive"
                onClick={() => {
                  if (confirm(`Delete domain "${item.domain}"?`)) {
                    mutation.mutate(item);
                  }
                }}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
