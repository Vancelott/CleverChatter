"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/solid";
import { createContext } from "react";

type Context = string;

export const SelectedRepoContext = createContext("");

export const RepoList = ({
  data,
  handleCallback,
}: {
  data: any;
  handleCallback: any;
}) => {
  const [selectedRepo, setSelectedRepo] = useState("");

  const totalRepos = data.length;
  const [page, setPage] = useState(1);
  const repoPerPage = 6;
  const start = (Number(page) - 1) * Number(repoPerPage);
  const end = start + Number(repoPerPage);

  const lastPage = totalRepos / repoPerPage;

  useEffect(() => {
    console.log(selectedRepo);
  }, [selectedRepo]);

  const paginatedRepos = data.slice(start, end);

  const [ariaSelected, setAriaSelected] = useState(false);

  const handleRepoSelection = (name: any) => {
    setSelectedRepo(name);
    // selectedRepo == name ? setAriaSelected(true) : false;
  };
  // const handleRepoSelection = ({ item }: any) => {
  //   setSelectedRepo(item.name);
  //   console.log(selectedRepo);
  //   // handleCallback(selectedRepo);
  // };

  return (
    <SelectedRepoContext.Provider value={selectedRepo}>
      <nav
        className="h-full overflow-y-auto border-2 border-white rounded-xl"
        aria-label="Directory"
      >
        <ul
          role="list"
          className="relative z-0 divide-y divide-gray-200 bg-blue-200"
        >
          {paginatedRepos.map((item: any) => (
            <li key={item.id} className="bg-blue-2" value={selectedRepo}>
              <div
                onClick={() => {
                  handleCallback(item.name), setSelectedRepo(item.name);
                }}
                className={`relative px-6 py-5 flex items-center space-x-3 hover:bg-blue-3 transition-bg-color duration-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 ${
                  selectedRepo == item.name ? "bg-blue-3" : "bg-blue-2"
                }`}
              >
                <div className="flex-shrink-0">
                  {/* <img
                      className="h-10 w-10 rounded-full"
                      src={person.imageUrl}
                      alt=""
                    /> */}
                </div>
                <div className="flex-1 min-w-0 hover:text-white">
                  <div className="focus:outline-none">
                    {/* Extend touch target to entire panel */}
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-lg font-semibold text-white">
                      {item.name}
                    </p>
                    {/* <p className="text-sm font-small max-w-[19rem] text-gray-400 truncate overflow-hidden">
                      {item.html_url}
                    </p> */}
                    {/* <p className="text-sm text-gray-500 truncate">
                        {person.role}
                      </p> */}
                  </div>
                </div>
              </div>
            </li>
          ))}
          <div className="flex flex-row items-center justify-center font-semibold space-x-2">
            <button
              className="p-1"
              onClick={() => {
                page !== 1 ? setPage(page - 1) : null;
              }}
            >
              <ArrowLeftCircleIcon className="w-10 h-10 text-blue-2" />
            </button>
            <p className="text-gray-800 text-lg px-4">{page}</p>
            <button
              className="p-1"
              onClick={() => {
                page !== lastPage ? setPage(page + 1) : null;
              }}
            >
              <ArrowRightCircleIcon className="w-10 h-10 text-blue-2" />
            </button>
          </div>
        </ul>
      </nav>
    </SelectedRepoContext.Provider>
  );
};

export default RepoList;
