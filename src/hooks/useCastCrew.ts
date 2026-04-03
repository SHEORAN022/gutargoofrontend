import { useState, useEffect, useCallback } from "react";
import { castCrewStore, Person, PersonRole } from "@/lib/castCrewStore";

export function useCastCrew() {
  const [people, setPeople] = useState<Person[]>(castCrewStore.getPeople());

  useEffect(() => {
    const unsubscribe = castCrewStore.subscribe(() => {
      setPeople(castCrewStore.getPeople());
    });
    return unsubscribe;
  }, []);

  const addPerson = useCallback((person: Omit<Person, "id" | "createdAt">) => {
    return castCrewStore.addPerson(person);
  }, []);

  const updatePerson = useCallback((id: string, updates: Partial<Omit<Person, "id" | "createdAt">>) => {
    return castCrewStore.updatePerson(id, updates);
  }, []);

  const deletePerson = useCallback((id: string) => {
    return castCrewStore.deletePerson(id);
  }, []);

  const searchPeople = useCallback((query: string, role?: PersonRole) => {
    return castCrewStore.searchPeople(query, role);
  }, []);

  const getByRole = useCallback((role: PersonRole) => {
    return castCrewStore.getByRole(role);
  }, []);

  return {
    people,
    addPerson,
    updatePerson,
    deletePerson,
    searchPeople,
    getByRole,
  };
}
