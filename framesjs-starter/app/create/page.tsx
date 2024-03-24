"use client";

import React, { useState } from "react";
import styled from "styled-components";

import TitleComponent from "./title";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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
  border: 2px dashed #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
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

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Image:", image);
    console.log("Name:", name);
    console.log("Description:", description);
    console.log("Goal:", goal);
    console.log("Wallet Address:", walletAddress);
  };

  return (
    <Container>
      <ContentContainer>
        <TitleComponent
          title="Create a Fundraiser"
          subtitle="Fill out the form below"
        />
        <DropZone
          onDrop={handleImageDrop}
          onDragOver={(event) => event.preventDefault()}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          {image ? (
            <img src={URL.createObjectURL(image)} alt="Uploaded" />
          ) : (
            <div>Drag & Drop Image Here or Click to Upload</div>
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
            type="text"
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
