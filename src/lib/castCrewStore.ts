// Shared store for Cast & Crew data
// In production, this would be backed by a database

export type PersonRole = "actor" | "director" | "producer" | "writer" | "music_director" | "cinematographer" | "editor";

export interface Person {
  id: string;
  name: string;
  image?: string;
  roles: PersonRole[];
  bio?: string;
  createdAt: Date;
}

// Initial demo data
const initialPeople: Person[] = [
  {
    id: "1",
    name: "Shah Rukh Khan",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    roles: ["actor"],
    bio: "Bollywood superstar",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Rajkumar Hirani",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    roles: ["director", "producer", "writer"],
    bio: "Acclaimed director known for PK, 3 Idiots",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    name: "A.R. Rahman",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    roles: ["music_director"],
    bio: "Oscar-winning music composer",
    createdAt: new Date("2024-01-05"),
  },
  {
    id: "4",
    name: "Alia Bhatt",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    roles: ["actor"],
    bio: "Leading Bollywood actress",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "5",
    name: "S.S. Rajamouli",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    roles: ["director"],
    bio: "Director of RRR, Baahubali",
    createdAt: new Date("2024-02-05"),
  },
];

// Simple in-memory store (would be replaced by database in production)
let people: Person[] = [...initialPeople];
let listeners: Set<() => void> = new Set();

export const castCrewStore = {
  getPeople: (): Person[] => [...people],
  
  getPersonById: (id: string): Person | undefined => {
    return people.find(p => p.id === id);
  },
  
  getByRole: (role: PersonRole): Person[] => {
    return people.filter(p => p.roles.includes(role));
  },
  
  searchPeople: (query: string, role?: PersonRole): Person[] => {
    const lowerQuery = query.toLowerCase();
    return people.filter(p => {
      const matchesName = p.name.toLowerCase().includes(lowerQuery);
      const matchesRole = role ? p.roles.includes(role) : true;
      return matchesName && matchesRole;
    });
  },
  
  addPerson: (person: Omit<Person, "id" | "createdAt">): Person => {
    const newPerson: Person = {
      ...person,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    people = [...people, newPerson];
    listeners.forEach(listener => listener());
    return newPerson;
  },
  
  updatePerson: (id: string, updates: Partial<Omit<Person, "id" | "createdAt">>): Person | undefined => {
    const index = people.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    people[index] = { ...people[index], ...updates };
    people = [...people];
    listeners.forEach(listener => listener());
    return people[index];
  },
  
  deletePerson: (id: string): boolean => {
    const initialLength = people.length;
    people = people.filter(p => p.id !== id);
    const deleted = people.length < initialLength;
    if (deleted) {
      listeners.forEach(listener => listener());
    }
    return deleted;
  },
  
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export const roleLabels: Record<PersonRole, string> = {
  actor: "Actor",
  director: "Director",
  producer: "Producer",
  writer: "Writer",
  music_director: "Music Director",
  cinematographer: "Cinematographer",
  editor: "Editor",
};
