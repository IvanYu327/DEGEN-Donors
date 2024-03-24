"use client";

import React from "react";
import styled from "styled-components";

const TitleContainer = styled.div`
  text-align: center;
`;

const Title = styled.h1`
  margin-bottom: 0;
`;

const Subtitle = styled.h2`
  margin-top: 0;
  text-align: right;
`;

interface TitleProps {
  title: string;
  subtitle: string;
}

const TitleComponent: React.FC<TitleProps> = ({ title, subtitle }) => {
  return (
    <TitleContainer>
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
    </TitleContainer>
  );
};

export default TitleComponent;
