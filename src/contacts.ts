import localforage from "localforage";
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";
import { IContact } from "./routes/contact";

export async function getContacts(query?: string | null) {
  await fakeNetwork(`getContacts:${query}`);
  let contacts: IContact[] | null = await localforage.getItem("contacts");
  if (!contacts) contacts = [];
  if (query) {
    contacts = matchSorter(contacts, query, { keys: ["first", "last"] });
  }
  return contacts.sort(sortBy("last", "createdAt"));
}

export async function createContact() {
  await fakeNetwork();
  let id = Math.random().toString(36).substring(2, 9);
  let contact = { id, createdAt: Date.now() };
  let contacts: IContact[] | null = await getContacts();
  contacts.unshift(contact as any);
  await set(contacts);
  return contact;
}

export async function getContact(id: string) {
  await fakeNetwork(`contact:${id}`);
  let contacts: IContact[] | null  = await localforage.getItem("contacts");
  let contact = contacts?.find(contact => contact.id === id);
  return contact ?? null;
}

export async function updateContact(id: string, updates: IContact) {
  await fakeNetwork();
  let contacts: IContact[] | null = await localforage.getItem("contacts");
  let contact = contacts?.find(contact => contact.id === id);
  if (!contact) throw new Error(`No contact found for ${id}`);
  Object.assign(contact, updates);
  await set(contacts);
  return contact;
}

export async function deleteContact(id: string) {
  let contacts: IContact[] | null = await localforage.getItem("contacts");
  let index = contacts?.findIndex(contact => contact.id === id);
  if (index && index > -1) {
    contacts?.splice(index, 1);
    await set(contacts);
    return true;
  }
  return false;
}

function set(contacts: IContact[] | null) {
  return localforage.setItem("contacts", contacts);
}

// fake a cache so we don't slow down stuff we've already seen
let fakeCache: { [key: string]: boolean } = {};

async function fakeNetwork(key?: string) {
  if (!key) {
    fakeCache = {};
  }

  if (key && fakeCache[key]) {
    return;
  }

  if(key){
    fakeCache[key] = true;
  }

  return new Promise(res => {
    setTimeout(res, Math.random() * 800);
  });
}