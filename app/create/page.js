"use client";

import axios from "axios";
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, ChevronLeft } from "lucide-react";

const CreatePage = () => {
  const { toast } = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [formInput, setFormInput] = useState({
    title: "",
    description: "",
    files: Array(2).fill(null),
  });

  const qoreInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_DUMMY_QOREBASE_URL,
    headers: {
      "x-qore-engine-admin-secret":
        process.env.NEXT_PUBLIC_DUMMY_QOREBASE_ACCESS_TOKEN,
    },
  });

  const getUploadToken = async ({ rowId, column }) => {
    try {
      const { data } = await qoreInstance.get(
        `/v1/files/token/table/data_files/id/${rowId}/column/${column}?access=write`
      );

      return data.token;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const removeData = async (rowId) => {
    try {
      const { data } = await qoreInstance.post("/v1/execute", {
        operations: [
          {
            operation: "Delete",
            instruction: {
              name: "remove",
              table: "data_files",
              condition: {
                $and: [{ id: rowId }],
              },
            },
          },
        ],
      });

      return data.results.remove;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name.startsWith("file_")) {
      const index = parseInt(name.split("_")[1], 10) - 1;
      setFormInput((prevInput) => {
        const newFiles = [...prevInput.files];
        newFiles[index] = files[0];
        return {
          ...prevInput,
          files: newFiles,
        };
      });
    } else {
      setFormInput((prevInput) => ({
        ...prevInput,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let response;

    try {
      setIsLoading(true);

      // Insert to Qorebase
      response = await qoreInstance.post("/v1/execute", {
        operations: [
          {
            operation: "Insert",
            instruction: {
              name: "insertData",
              table: "data_files",
              data: {
                title: formInput.title,
                description: formInput.description,
              },
            },
          },
        ],
      });

      if (response) {
        for (let index = 0; index < formInput.files.length; index++) {
          const file = formInput.files[index];
          if (file) {
            const formData = new FormData();
            formData.append(`file_${index + 1}`, file);

            // Get Upload Token
            const token = await getUploadToken({
              rowId: response.data.results.insertData[0].id,
              column: `file_${index + 1}`,
            });

            // Upload File
            await qoreInstance.post(
              `/v1/files/upload?token=${token}`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
          }
        }

        toast({
          title: "Success!",
          description: "Successfully submit new data",
        });

        setFormInput({
          title: "",
          description: "",
          files: Array(2).fill(null),
        });

        router.push("/");
      }
    } catch (error) {
      if (response) {
        await removeData(response.data.results.insertData[0].id);
      }

      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main className="w-full min-h-screen bg-slate-50 mx-auto px-[200px] py-[100px]">
        <Link href="/">
          <Button variant="destructive">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full bg-slate-50 border border-slate-100 px-10 shadow-slate-200/70 shadow-xl py-8 rounded-2xl mt-10"
        >
          <div className="grid grid-cols-3 items-center py-4">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formInput.title}
              onChange={handleChange}
              placeholder="Enter title"
              required
              className="bg-white px-4 py-3 rounded-lg border border-slate-100 shadow-sm focus:ring-cyan-500 focus:ring-1 outline-none"
            />
          </div>

          <div className="grid grid-cols-3 items-center py-4">
            <label htmlFor="title">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formInput.description}
              onChange={handleChange}
              placeholder="Enter description"
              required
              className="bg-white px-4 py-3 rounded-lg border border-slate-100 shadow-sm focus:ring-cyan-500 focus:ring-1 outline-none"
            />
          </div>
          {[1, 2, 3].map((index) => (
            <div key={index} className="grid grid-cols-3 items-center py-4">
              <label htmlFor="picture">{`File ${index}`}</label>
              <input
                type="file"
                id={`file_${index}`}
                name={`file_${index}`}
                accept="*"
                onChange={handleChange}
                className="bg-white px-4 py-3 rounded-lg border border-slate-100 shadow-sm focus:ring-cyan-500 focus:ring-1 outline-none"
              />
            </div>
          ))}
          {isLoading ? (
            <Button
              disabled
              className="w-1/4 rounded-xl px-4 py-2 ml-auto mt-4"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button
              type="submit"
              className="bg-teal-500 text-white w-1/4 rounded-xl px-4 py-2 ml-auto mt-4 hover:bg-teal-400 disabled:bg-teal-700 transtion duration-300"
            >
              <Upload className="mr-2 h-4 w-4" />
              Submit
            </Button>
          )}
        </form>
      </main>
    </>
  );
};

export default CreatePage;
