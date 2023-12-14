"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Loader2, Plus, Edit, Info } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const qoreInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_DUMMY_QOREBASE_URL,
    headers: {
      "x-qore-engine-admin-secret":
        process.env.NEXT_PUBLIC_DUMMY_QOREBASE_ACCESS_TOKEN,
    },
  });

  const getDataFiles = async () => {
    try {
      setIsLoading(true);
      const { data } = await qoreInstance.post("/v1/execute", {
        operations: [
          {
            operation: "Select",
            instruction: {
              name: "getData",
              table: "data_files",
              limit: 10000,
            },
          },
        ],
      });

      const result = data.results.getData;
      setData(result);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDataFiles();
  }, []);

  return (
    <>
      <main className="w-full min-h-screen bg-slate-50 mx-auto px-[200px] py-[100px]">
        <h1 className="font-bold text-slate-800 text-3xl text-center mb-6">
          Simple App
        </h1>
        <Link href="/create">
          <Button className="mb-6">
            <Plus className="mr-2 h-4 w-4" /> Create
          </Button>
        </Link>

        {isLoading ? (
          <div className="mt-10 w-full flex justify-center items-center">
            <Button disabled variant="outline">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Create At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => {
                const createdAt = new Date(item.created_at);
                const updatedAt = new Date(item.updated_at);

                const formattedCreatedAt = `${createdAt.getDate()} ${createdAt.toLocaleString(
                  "default",
                  { month: "short" }
                )} ${createdAt.getFullYear()}, ${createdAt.getHours()}:${createdAt.getMinutes()}`;
                const formattedUpdatedAt = `${updatedAt.getDate()} ${updatedAt.toLocaleString(
                  "default",
                  { month: "short" }
                )} ${updatedAt.getFullYear()}, ${updatedAt.getHours()}:${updatedAt.getMinutes()}`;

                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{formattedCreatedAt}</TableCell>
                    <TableCell>{formattedUpdatedAt}</TableCell>
                    <TableCell className="flex gap-x-3">
                      <Link href={`detail/${item.id}`}>
                        <Button variant="secondary">
                          <Info className="mr-2 h-4 w-4" /> Detail
                        </Button>
                      </Link>

                      <Link href={`update/${item.id}`}>
                        <Button variant="secondary">
                          <Edit className="mr-2 h-4 w-4" /> Update
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </main>
      <Toaster />
    </>
  );
};

export default HomePage;
