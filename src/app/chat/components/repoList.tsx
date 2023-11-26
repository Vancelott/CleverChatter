"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/solid";
import { createContext } from "react";
import { Repository } from "@/app/types";

export const RepoList = ({
  data,
  handleCallback,
}: {
  data: Repository[];
  handleCallback: (selectedRepo: string) => void;
}) => {
  const [selectedRepo, setSelectedRepo] = useState("");

  const totalRepos = data.length;
  const [page, setPage] = useState(1);
  const repoPerPage = 6;
  const start = (Number(page) - 1) * Number(repoPerPage);
  const end = start + Number(repoPerPage);

  const lastPage = totalRepos / repoPerPage;
  // const paginatedRepos = [];
  const paginatedRepos = data.slice(start, end);

  return (
    <nav className="max-h-fit min-w-[16.5rem] min-h-[29.2rem] overflow-y-visible border-2 border-white rounded-xl">
      <ul
        role="list"
        className={`h-full relative z-0 divide-y divide-gray-200 bg-blue-0 rounded-xl ${
          paginatedRepos.length === 0 ? "flex items-center justify-center" : ""
        }`}
      >
        {paginatedRepos.length === 0 && (
          <li className="text-lg font-semibold text-white max-w-[16rem] text-center px-2">
            No repositories found. Please ensure your repositories are set to
            public visibility or check if you have any repositories available.{" "}
          </li>
        )}
        {paginatedRepos.map((item: Repository) => (
          <li
            key={item.id}
            className={`first:rounded-t-xl hover:bg-blue-4 transition-bg-color duration-300 ${
              selectedRepo === item.name
                ? "bg-blue-3 text-gray-200"
                : "bg-blue-2"
            }`}
            value={selectedRepo}
          >
            <div
              onClick={() => {
                handleCallback(item.name), setSelectedRepo(item.name);
              }}
              className={`relative px-6 py-5 flex items-center grow-0 space-x-3`}
            >
              <div className="flex-1 min-w-0 hover:text-white">
                <div className="focus:outline-none">
                  {/* Extend touch target to entire panel */}
                  <p className="text-lg font-semibold text-white whitespace-nowrap truncate overflow-hidden">
                    {item.name}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
        {paginatedRepos.length > 0 && (
          <div className="flex flex-row items-center justify-center font-semibold space-x-2">
            <button
              className="p-1"
              onClick={() => {
                page !== 1 ? setPage(page - 1) : null;
              }}
            >
              <ArrowLeftCircleIcon className="w-10 h-10 text-blue-3" />
            </button>
            <p className="text-gray-100 text-xl font-bold px-4 py-1.5 ">
              {page}
            </p>
            <button
              className="p-1"
              onClick={() => {
                page !== lastPage ? setPage(page + 1) : null;
              }}
            >
              <ArrowRightCircleIcon className="w-10 h-10 text-blue-3" />
            </button>
          </div>
        )}
      </ul>
    </nav>
  );
};

export default RepoList;
