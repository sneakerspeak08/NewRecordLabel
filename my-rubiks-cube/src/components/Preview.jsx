import React from "react";
import MatrixBackground from "./MatrixBackground";
import { Link } from "react-router-dom";

const Preview = () => {
  return (
    <div className="relative w-full h-screen bg-black">
      {/* Matrix Background */}
      <MatrixBackground />

      {/* Neon Header */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-50 text-center">
        <Link to="/">
          <h1 className="font-mono text-5xl neon-text cursor-pointer">
            Sutakku Records
          </h1>
        </Link>
      </div>

      {/* Content Section */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center text-center w-3/4">
        <p className="text-green-400 font-mono mb-4">
          So I see you figured out the password... lucky you!! Here's a little preview of what's to come on Sutakku Records:
        </p>
        <iframe
          width="100%"
          height="166"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1784050971%3Fsecret_token%3Ds-LuSKWEXKvGP&color=%2300ff5d&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
        ></iframe>
        <div
          style={{
            fontSize: "10px",
            color: "#cccccc",
            lineBreak: "anywhere",
            wordBreak: "normal",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            fontFamily:
              "Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans",
          }}
        >
          <a
            href="https://soundcloud.com/schwalbizzy"
            title="[schwalbizzy]"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#cccccc", textDecoration: "none" }}
          >
            [schwalbizzy]
          </a>{" "}
          ·{" "}
          <a
            href="https://soundcloud.com/schwalbizzy/dance-virus-deep-within-2/s-LuSKWEXKvGP"
            title="Dance Virus - Deep Within"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#cccccc", textDecoration: "none" }}
          >
            Dance Virus - Deep Within
          </a>
        </div>
      </div>
    </div>
  );
};

export default Preview;
