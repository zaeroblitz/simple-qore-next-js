"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, Loader2 } from "lucide-react";

const UpdatePage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();

  const [data, setData] = useState({});
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const qoreInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_DUMMY_QOREBASE_URL,
    headers: {
      "x-qore-engine-admin-secret":
        process.env.NEXT_PUBLIC_DUMMY_QOREBASE_ACCESS_TOKEN,
    },
  });

  const getStorageToken = async () => {
    try {
      setIsLoading(true);
      const { data } = await qoreInstance.post("/v1/storage/token");

      setToken(data.token);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getData = async () => {
    try {
      setIsLoading(true);
      const { data } = await qoreInstance.post("/v1/execute", {
        operations: [
          {
            operation: "Select",
            instruction: {
              name: "data",
              table: "data_files",
              condition: {
                $and: [{ id: params.id }],
              },
            },
          },
        ],
      });

      const result = data.results.data[0];
      setData(result);
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getStorageToken();
    getData();
  }, []);

  return (
    <>
      <main className="w-full min-h-screen bg-slate-50 mx-auto px-[200px] py-[100px]">
        <Link href="/">
          <Button variant="destructive">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
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
          <section className="w-full h-fit mt-10">
            <h1 className="font-bold text-slate-800">Detail #{params.id}</h1>
            <div className="flex flex-col w-full bg-slate-50 border border-slate-100 px-10 shadow-slate-200/70 shadow-xl py-8 rounded-2xl mt-10">
              <div className="grid grid-cols-3 items-center py-4">
                <label htmlFor="title">Title</label>
                <p
                  type="text"
                  id="title"
                  name="title"
                  className="text-slate-900"
                >
                  {data?.title}
                </p>
              </div>

              <div className="grid grid-cols-3 items-center py-4">
                <label htmlFor="title">Description</label>
                <p
                  type="text"
                  id="title"
                  name="title"
                  className="text-slate-900"
                >
                  {data?.description}
                </p>
              </div>

              {data.file_1 && token && (
                <div className="grid grid-cols-3 items-center py-4">
                  <label htmlFor="title">File 1</label>
                  <Link
                    href={`${data?.file_1?.url}?token=${token}`}
                    passHref
                    target="_blank"
                  >
                    <Button variant="outline" className="w-fit">
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  </Link>
                </div>
              )}

              {data.file_2 && token && (
                <div className="grid grid-cols-3 items-center py-4">
                  <label htmlFor="title">File 2</label>
                  <Link
                    href={`${data?.file_2?.url}?token=${token}`}
                    passHref
                    target="_blank"
                  >
                    <Button variant="outline" className="w-fit">
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  </Link>
                </div>
              )}

              {data.file_3 && token && (
                <div className="grid grid-cols-3 items-center py-4">
                  <label htmlFor="title">File 3</label>

                  <Link
                    href={`${data?.file_3?.url}?token=${token}`}
                    passHref
                    target="_blank"
                  >
                    <Button variant="outline" className="w-fit">
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default UpdatePage;
