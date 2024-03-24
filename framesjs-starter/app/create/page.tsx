"use client";

import React, { useState } from "react";
import styled from "styled-components";

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

const FormImage = styled.img`
  max-width: 100%;
  max-height: 100%;
`;

const dynamicEmbed = styled.button`
  color: red;
`;

const FlexRow = styled.div`
  display: flex;
  gap: 10px; /* Adjust gap as needed */
  align-items: center; /* Vertically align items if they are of different heights */
`;

const Page = () => {
  const [image, setImage] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const [fID, setFId] = useState("");
  const [email, setEmail] = useState("");

  const key = process.env.KEY;
  const environmentId = process.env.ENVIRONMENT_ID;

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

    if (!image) {
      return;
    }

    const data = new FormData();
    data.set("file", image);
    const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/create/upload`, {
      method: "POST",
      body: data,
    });
    const { IpfsHash } = await res.json();

    const newFundRaiserRef = await push(ref(database, "/"), {
      address: walletAddress,
      chainId: "84532",
      description: description,
      end_time: "1713951647000",
      goal: Math.round(Number(goal) * (1 / 3379.25) * 1e18),
      title: name,
      image: IpfsHash,
    });

    const newFundRaiserUrl =
      process.env.NEXT_PUBLIC_HOST +
      newFundRaiserRef
        .toString()
        .substring(newFundRaiserRef.root.toString().length - 1);
    alert(`Your new fundraiser is now accessible at ${newFundRaiserUrl}`);
    window.open(newFundRaiserUrl, "_blank", "noopener,noreferrer");
  };

  async function createEmbeddableWallet() {
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer dyn_DVEKyNqx595b3LhjOkwXGTCP4f6lMozStNZv3Rmaf8442lhylm3ZwBHf`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email: "billybobkoe@yahoo.ca",
        fid: 1,
        chains: "SOL",
      }),
    };

    const response = await fetch(
      `https://app.dynamic.xyz/api/v0/environments/10e13bf6-ba3a-4eed-87ad-699b3cf8ecfb/embeddedWallets/farcaster`,
      options
    ).then((r) => r.json());

    let newWallets: string[];

    console.debug(response, response?.user?.wallets);
    newWallets = response.user.wallets.map((wallet: any) => wallet.publicKey);

    alert(
      `Your Dynamic wallet is ${newWallets}. Login in to https://demo.dynamic.xyz/?use-environment=Farcaster" to access it.`
    );
    window.open(
      "https://demo.dynamic.xyz/?use-environment=Farcaster",
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <Container>
      <ContentContainer>
        <TitleComponent />
        <DropZone
          onDrop={handleImageDrop}
          onDragOver={(event) => event.preventDefault()}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          {image ? (
            <FormImage src={URL.createObjectURL(image)} alt="Uploaded" />
          ) : (
            <div style={{ width: "250px" }}>
              Upload your fundraiser media, powered by
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
          or
          <FlexRow>
            <Button
              style={{ backgroundColor: "gray" }}
              type="button"
              onClick={() => createEmbeddableWallet()}
            >
              (BETA) Create an embeddable SOL wallet with
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <img
                  style={{ zoom: "30%", marginTop: "20px" }}
                  src="/dynamic.png"
                  alt="Pinata"
                />
              </div>
            </Button>

            <div
              style={{
                display: "flex",
                flexFlow: "wrap",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FormInput
                type="number"
                placeholder="$ Farcaster ID"
                value={fID}
                onChange={(e) => setFId(e.target.value)}
                style={{ width: "100%", margin: "10px" }}
              />
              <FormInput
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", margin: "10px" }}
              />
            </div>
          </FlexRow>
          <Button type="submit">Deploy</Button>
        </Form>
      </ContentContainer>
    </Container>
  );
};

export default Page;
