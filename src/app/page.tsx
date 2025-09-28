"use client";

import { TableFrame } from "@/components/main/tableFrame";
import type { Domain } from "@/interfaces/domain";
import { useQuery } from "@tanstack/react-query";
import { SelectStatus } from "@/components/main/selectStatus";
import { useEffect, useState } from "react";
import { SearchBox } from "@/components/main/searchBox";
import { IsActive } from "@/components/main/isActive";
import { DomainModal } from "@/components/main/modal";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

async function getData(search: string, status: string, isActive: boolean) {
  const param = new URLSearchParams();

  if (search) {
    param.append("search", search);
  }

  if (status) {
    param.append("status", status);
  }

  if (isActive) {
    param.append("isActive", String(isActive));
  }

  const url = `https://domain-danajo.liara.run/api/Domain/?${param.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    return result.results;
  } catch (error) {
    console.error(error);
  }
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isActive, setIsActive] = useState(
    searchParams.get("isActive") === "true"
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Domain | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();

    if (status) params.set("status", status);
    if (search) params.set("search", search);
    if (isActive) params.set("isActive", "true");

    const queryString = params.toString();
    router.push(`?${queryString}`, { scroll: false });
  }, [status, search, isActive, router]);

  const { data, isLoading, refetch } = useQuery<Domain[]>({
    queryKey: ["domains", status, search, isActive],
    queryFn: () => getData(search, status, isActive),
  });

  function handleNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function handleEdit(d: Domain) {
    setEditing(d);
    setModalOpen(true);
  }

  return (
    <main className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <SearchBox value={search} setValue={setSearch} />
        <SelectStatus value={status} setValue={setStatus} />
        <IsActive value={isActive} setValue={setIsActive} />
        <div className="ml-auto">
          <Button onClick={handleNew}>New Domain</Button>
        </div>
      </div>
      <TableFrame
        data={data}
        isLoading={isLoading}
        onEdit={handleEdit}
        refetch={refetch}
      />
      <DomainModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editing}
        refetch={refetch}
      />
    </main>
  );
}
