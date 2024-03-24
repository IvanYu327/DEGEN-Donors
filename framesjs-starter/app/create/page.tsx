"use client";

import React, { useState } from "react";
import styled from "styled-components";

import FontStyles from "../globalStyles";

import TitleComponent from "./title";

import { initializeApp } from "firebase/app";
import { getDatabase, ref, push } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeiitajd2hd8VK1O_LQbxnC9ivFrNEAjs",
  authDomain: "defi-donors.firebaseapp.com",
  projectId: "defi-donors",
  storageBucket: "defi-donors.appspot.com",
  messagingSenderId: "993271436077",
  appId: "1:993271436077:web:8e5dad32ec7f87638779a4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase();

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: "SF Mono", monospace;
  padding-bottom: 50px;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 80%;
`;

const DropZone = styled.div`
  width: 400px;
  height: 250px;
  border: 5px dashed #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &:hover {
    border-color: #007bff;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 400px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  cursor: pointer;
`;

const HiddenInput = styled.input`
  display: none;
`;

const FormInput = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
`;

const dynamicEmbed = styled.button`
  color: red;
`
import pinata from "../public/pinata.png"

const Page = () => {
  const [image, setImage] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const handleImageDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Image:", image);
    console.log("Name:", name);
    console.log("Description:", description);
    console.log("Goal:", goal);
    console.log("Wallet Address:", walletAddress);

    const newFundRaiserRef = await push(ref(database, "/"), {
      address: walletAddress,
      chainId: "84532",
      description: description,
      end_time: "1713951647000",
      goal: Math.round(Number(goal) * (1 / 3379.25) * 1e18),
      title: name
    })

    const newFundRaiserUrl = "http://localhost:3000" + newFundRaiserRef.toString().substring(newFundRaiserRef.root.toString().length-1)
    alert(`Your new fundraiser is now accessible at ${newFundRaiserUrl}`)
    window.open(newFundRaiserUrl, '_blank', 'noopener,noreferrer')
  };

  return (
    <Container>
      <FontStyles />
      <ContentContainer>
        <TitleComponent />
        <DropZone
          onDrop={handleImageDrop}
          onDragOver={(event) => event.preventDefault()}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          {image ? (
            <img src={URL.createObjectURL(image)} alt="Uploaded" />
          ) : (
            <div style={{ width: "225px" }}>
              Upload your fundraiser image/video, powered by
              <img src="/pinata.png" alt="Pinata" />
            </div>
          )}
        </DropZone>
        <HiddenInput
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <Form onSubmit={handleFormSubmit}>
          <FormInput
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FormInput
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <FormInput
            type="number"
            placeholder="$ Your starting goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <FormInput
            type="text"
            placeholder="# Wallet Address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
          />
          <Button type="submit">Deploy</Button>
        </Form>
      </ContentContainer>
    </Container>
  );
};

export default Page;
