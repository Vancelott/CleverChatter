"use server";

import createChat from "./createChat";
import GetAllChats from "./getAllChats";

export async function createChatReq(userInput: string, aiInput: string) {
  await createChat(userInput, aiInput);
}

export async function fetchChatsAction() {
  let result;
  GetAllChats().then((data) => (result = data));

  return result!;
}
