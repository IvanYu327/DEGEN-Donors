import { ClientProtocolId } from "frames.js";
import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameInput,
  FrameReducer,
  NextServerPageProps,
  getFrameMessage,
  getPreviousFrame,
  useFramesReducer,
} from "frames.js/next/server";
import Link from "next/link";
import { DEFAULT_DEBUGGER_HUB_URL, createDebugUrl } from "../debug";
import { currentURL } from "../utils";

import { initializeApp } from "firebase/app";
import { get, getDatabase, ref } from "firebase/database";

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

type RawState = {
  title: string;
  description: string;
  goal: number;
  end_time: number;
  donations: { txId: string; address: string; value: number }[];
  chainId: string;
  address: string;
  image: string;
};

type State = {
  title: string;
  description: string;
  raised: number;
  goal: number;
  days_left: number;
};

const acceptedProtocols: ClientProtocolId[] = [
  {
    id: "xmtp",
    version: "vNext",
  },
  {
    id: "farcaster",
    version: "vNext",
  },
];

const reducer: FrameReducer<State> = (state, action) => {
  return {
    ...state, // Spread the existing state
    // total_button_presses: state.total_button_presses + 1,
    // active: action.postBody?.untrustedData.buttonIndex
    //   ? String(action.postBody?.untrustedData.buttonIndex)
    //   : "1",
  };
};

const getInitialState = async (rawState: RawState) => {
  return {
    title: rawState.title,
    description: rawState.description,
    goal: Math.round((rawState.goal / ((1 / 3379.25) * 1e18)) * 100) / 100,
    raised:
      Math.round(
        (Object.values(rawState.donations ?? {}).reduce(
          (acc, v) => acc + v.value,
          0
        ) /
          ((1 / 3379.25) * 1e18)) *
          100
      ) / 100,
    days_left: Math.ceil(
      (rawState.end_time - Date.now()) / (1000 * 60 * 60 * 24)
    ),
  };
};

interface HomeProps {
  params: { id: string };
  searchParams: NextServerPageProps["searchParams"];
}

// This is a react server component only
export default async function Home({ params, searchParams }: HomeProps) {
  // const url = currentURL("/");
  const previousFrame = getPreviousFrame<State>(searchParams);
  const dbRef = ref(database, params.id);
  const snapshot = await get(dbRef);
  if (!snapshot.exists()) {
    throw new Error("No data available");
  }

  const rawState: RawState = snapshot.val();
  const img = rawState.image;

  const initialState: State = await getInitialState(rawState);

  const frameMessage = await getFrameMessage(previousFrame.postBody, {
    hubHttpUrl: DEFAULT_DEBUGGER_HUB_URL,
  });

  if (frameMessage && !frameMessage?.isValid) {
    throw new Error("Invalid frame payload");
  }

  const [state, dispatch] = useFramesReducer<State>(
    reducer,
    initialState,
    previousFrame
  );

  // Here: do a server side side effect either sync or async (using await), such as minting an NFT if you want.
  // example: load the users credentials & check they have an NFT

  console.log("info: state is:", state);
  console.log("info: message is:", frameMessage);

  // if (frameMessage?.transactionId) {
  //   const txId = frameMessage?.transactionId

  //   return (
  //     <FrameContainer
  //       postUrl={`/${params.id}`}
  //       pathname={`/${params.id}`}
  //       state={state}
  //       previousFrame={previousFrame}
  //       accepts={acceptedProtocols}>
  //       <FrameImage aspectRatio="1.91:1">
  //           <div tw="flex">Processing Transaction</div>
  //           <div tw="flex">{txId.substring(0, 6) + "..." + txId.substring(txId.length - 6)}</div>
  //       </FrameImage>
  //     </FrameContainer>
  //   );
  // }

  const percent = (state.raised / state.goal) * 100;
  const percent_string = percent.toFixed(2) + "%";

  // then, when done, return next frame
  return (
    <div className="p-4">
      {/* frames.js starter kit. The Template Frame is on this page, it&apos;s in
      the html meta tags (inspect source).{" "}
      <Link href={createDebugUrl(url)} className="underline">
        Debug
      </Link>{" "}
      or see{" "}
      <Link href="/examples" className="underline">
        other examples
      </Link> */}
      <FrameContainer
        postUrl={`/${params.id}`}
        pathname={`/${params.id}`}
        state={state}
        previousFrame={previousFrame}
        accepts={acceptedProtocols}
      >
        {/* <FrameImage src="https://framesjs.org/og.png" /> */}
        <FrameImage aspectRatio="1.91:1">
          <div tw="w-full h-full bg-gray-200 flex flex-col ">
            <div tw="bg-slate-700 text-white p-12 flex justify-between items-center">
              <div>Donate Now</div>
            </div>
            {/* Image, with title, and description to the right */}
            <div tw="flex flex-col">
              <div tw="flex flex-row pl-8 pt-8 pb-8">
                <div tw="flex flex-row">
                  <img
                    src={`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${rawState.image}`}
                    height="200"
                    width="200"
                    alt="image"
                  />
                </div>
                <div tw="flex flex-col pl-8 w-210">
                  <h2 tw="mt-0 pt-0 mb-0 pb-0">{state?.title}</h2>
                  <p tw="mt-0 pt-0 mb-0 pb-0">
                    {state?.description}
                  </p>
                </div>
              </div>
              {/* Progress bar */}
              <div tw="flex flex-col items-center">
                <div
                  style={{ background: "#D9D9D9" }}
                  tw="flex w-95/100 h-8 rounded-lg overflow-hidden"
                >
                  <div
                    tw="h-full"
                    style={{ background: "#285FCD", width: percent_string }}
                  ></div>
                  {/* Adjust width dynamically */}
                </div>
                {/* Progress bar info */}
                <div tw="flex w-95/100 h-16 justify-between">
                  <div tw="flex">
                    <span tw="pr-2">${state?.raised}</span>
                    of ${state?.goal} raised
                  </div>
                  <div tw="flex">{state?.days_left} days left</div>
                </div>
              </div>
            </div>
          </div>
        </FrameImage>
        <FrameButton
          action="tx"
          target={`http://localhost:3000/${params.id}/transactions/target?amount=0.01`}
          post_url={`http://localhost:3000/frames?p=/${params.id}/transactions/processing`}
        >
          Donate $0.01
        </FrameButton>
        <FrameButton
          action="tx"
          target={`http://localhost:3000/${params.id}/transactions/target?amount=0.03`}
          post_url={`http://localhost:3000/frames?p=/${params.id}/transactions/processing`}
        >
          Donate $0.03
        </FrameButton>
        <FrameInput text="Enter Custom Amount in $" />
        <FrameButton
          action="tx"
          target={`http://localhost:3000/${params.id}/transactions/target?amount=custom`}
          post_url={`http://localhost:3000/frames?p=/${params.id}/transactions/processing`}
        >
          Donate Custom
        </FrameButton>
        <FrameButton
          action="post"
          target={`http://localhost:3000/${params.id}/stats`}
        >
          Stats
        </FrameButton>
      </FrameContainer>
    </div>
  );
}
