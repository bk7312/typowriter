"use client";

import { ChangeEvent, useState, useRef, useEffect } from "react";
import { data } from "../data/quotes.js";
// data source: https://gist.github.com/JakubPetriska/060958fd744ca34f099e947cd080b540

const getQuote = () => data[Math.floor(Math.random() * data.length)];
const mixedChars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const lowerChars = "abcdefghijklmnopqrstuvwxyz";
const randomChar = (charSet: string) =>
  charSet[Math.floor(Math.random() * charSet.length)];

export default function Home() {
  const [game, setGame] = useState({
    text: "Type as fast as you can, but not faster than the speed limit, else you'll get an auto-typo!",
    cheat: false,
    limit: 350,
    isTyping: false,
    isFinished: false,
    start: 0,
    end: 0,
    cpm: 0,
  });

  const [typed, setTyped] = useState("");

  const cheatRef = useRef<HTMLInputElement>(null);
  const cpmRef = useRef<HTMLInputElement>(null);
  const typedRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typedRef.current) typedRef.current.focus();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setGame((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleChangeTyped = (e: ChangeEvent<HTMLTextAreaElement>) => {
    let val = e.currentTarget.value;
    if (val === "") {
      e.currentTarget.style.backgroundColor = "white";
      setTyped(val);
      setGame((prev) => ({
        ...prev,
        isTyping: false,
        start: 0,
        end: 0,
        cpm: 0,
      }));
      if (cheatRef.current) cheatRef.current.disabled = false;
      if (cpmRef.current) cpmRef.current.disabled = false;
      return;
    }

    if (!game.isTyping) {
      setGame((prev) => ({
        ...prev,
        isTyping: true,
        start: Date.now(),
      }));
      if (cheatRef.current) cheatRef.current.disabled = true;
      if (cpmRef.current) cpmRef.current.disabled = true;
    }

    let end = Date.now();
    const cpm = (60 * 1000 * val.length) / (end - game.start);
    setGame((prev) => ({
      ...prev,
      end: end,
      cpm: cpm,
    }));

    if (game.cheat) {
      val = game.text.slice(0, val.length);
    } else if (cpm > game.limit) {
      if (
        val.slice(-5) === game.text.slice(val.length - 5, val.length) &&
        !val.slice(-3).includes(" ")
      ) {
        if (cpm > 1.5 * game.limit) {
          val = val.slice(0, -1) + randomChar(mixedChars);
        } else if (cpm > 1.2 * game.limit) {
          val = val.slice(0, -1) + randomChar(lowerChars);
        } else {
          val = val.slice(0, -2) + val.at(-1) + val.at(-2);
        }
      }
    }

    setTyped(val);
    if (val === game.text) {
      e.currentTarget.disabled = true;
      setGame((prev) => ({
        ...prev,
        isFinished: true,
      }));
    } else if (val === game.text.slice(0, val.length)) {
      e.currentTarget.style.backgroundColor = "lime";
    } else {
      e.currentTarget.style.backgroundColor = "coral";
    }
  };

  const resetGame = () => {
    setGame((prev) => ({
      ...prev,
      text: getQuote(),
      isTyping: false,
      isFinished: false,
      start: 0,
      end: 0,
      cpm: 0,
    }));
    setTyped("");
    if (typedRef.current) {
      typedRef.current.disabled = false;
      typedRef.current.style.backgroundColor = "white";
    }
    if (cheatRef.current) {
      cheatRef.current.disabled = false;
    }
    if (cpmRef.current) {
      cpmRef.current.disabled = false;
    }
    if (typedRef.current) typedRef.current.focus();
  };

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 p-8 max-w-xl mx-auto">
      <h1 className="text-4xl">Typowriter</h1>
      <h3 className="text-xl">The typing game with an auto-typo feature!</h3>
      <p className="mt-4">
        Characters per minute: {Math.round(game.cpm)} / {game.limit} CPM
      </p>
      <div className="h-5 w-full bg-neutral-200 flex justify-center flex-col">
        <div
          className="h-2"
          style={{
            width: `${(80 * game.cpm) / game.limit}%`,
            backgroundColor: `${game.cpm / game.limit > 1 ? "coral" : "green"}`,
          }}
        ></div>
      </div>
      {game.isFinished ? (
        <>
          <p>
            Averaged {game.cpm.toFixed(2)} CPM on a {game.limit} CPM auto-typo{" "}
            {game.cheat ? "(with 100% accuracy cheat!)" : ""}
          </p>
          <p>Press &quot;Tab&quot; + &quot;Enter&quot; to play again.</p>
        </>
      ) : (
        <p>Type the text below:</p>
      )}
      <p className="border rounded px-4 py-2 bg-white select-none w-full">
        {game.text}
      </p>
      <textarea
        className="px-4 py-2 w-full"
        cols={45}
        rows={5}
        placeholder={game.text}
        name="typed"
        value={typed}
        onChange={(e) => handleChangeTyped(e)}
        ref={typedRef}
      />
      <label htmlFor="cheat" className="flex gap-2 items-center">
        <input
          type="checkbox"
          name="cheat"
          id="cheat"
          checked={game.cheat}
          onChange={(e) => handleChange(e)}
          ref={cheatRef}
        />
        Enable 100% accuracy cheat
      </label>
      <label htmlFor="limit" className="flex gap-2 items-center">
        Auto-typo at:
        <input
          className="w-20"
          type="number"
          name="limit"
          id="limit"
          value={game.limit}
          onChange={(e) => handleChange(e)}
          ref={cpmRef}
        />
        CPM
      </label>
      <button
        className="border px-4 py-2 rounded bg-blue-400"
        name="reset"
        onClick={() => resetGame()}
      >
        Reset
      </button>
    </main>
  );
}
