"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getAnalogyTopic, saveAnalogyTopic } from "@/lib/storage";

interface AnalogyContextValue {
    analogyTopic: string;
    setAnalogyTopic: (topic: string) => void;
}

const AnalogyContext = createContext<AnalogyContextValue>({
    analogyTopic: "",
    setAnalogyTopic: () => { },
});

export function AnalogyProvider({ children }: { children: ReactNode }) {
    const [analogyTopic, setAnalogyTopicState] = useState("");

    // Hydrate from localStorage once mounted (client-only)
    useEffect(() => {
        setAnalogyTopicState(getAnalogyTopic() ?? "");
    }, []);

    const setAnalogyTopic = (topic: string) => {
        saveAnalogyTopic(topic);
        setAnalogyTopicState(topic);
    };

    return (
        <AnalogyContext.Provider value={{ analogyTopic, setAnalogyTopic }}>
            {children}
        </AnalogyContext.Provider>
    );
}

export function useAnalogy() {
    return useContext(AnalogyContext);
}
