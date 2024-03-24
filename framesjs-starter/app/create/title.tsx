"use client";

import React from "react";
import styled from "styled-components";

const Container = styled.div`
  margin-top: 50px;
  font-family: "SF Mono", monospace;
`;

const TitleContainer = styled.div`
  text-align: center;
  padding-right: 75px;
  font-size: 100px;
  font-weight: 700;
`;

const Title = styled.h1`
  color: #295fcd;
  margin-bottom: 0;
  padding-bottom: 0;
`;

const SubtitleContainer = styled.div`
  margin-left: auto;
  width: 400px;
  font-size: 24px;
  font-weight: 400;

  transform: translateY(-30px);
`;

const Subtitle = styled.h2`
  margin-top: 0;
  padding-top: 0;
  text-align: left;
`;

interface TitleProps {
  title?: string;
  subtitle?: string;
}

const TitleComponent: React.FC<TitleProps> = ({ title, subtitle }) => {
  return (
    <Container>
      <TitleContainer>
        <Title>{title ? title : "$DEGEN Donors"}</Title>
      </TitleContainer>
      <SubtitleContainer>
        {subtitle ? (
          <Subtitle>{subtitle}</Subtitle>
        ) : (
          <Subtitle>
            deploy your own fundraiser to your farcaster following{" "}
            <span style={{ fontWeight: "1000" }}>in seconds</span>.
          </Subtitle>
        )}
      </SubtitleContainer>
    </Container>
  );
};

export default TitleComponent;
