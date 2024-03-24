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
import { Web3 } from "web3";
import { DEFAULT_DEBUGGER_HUB_URL } from "../../debug";
import { initializeApp } from "firebase/app";
import { get, getDatabase, ref, set, push } from "firebase/database";
import { PinataFDK } from "pinata-fdk";

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

const fdk = new PinataFDK({
  pinata_jwt: process.env.PINATA_JWT!,
  pinata_gateway: process.env.NEXT_PUBLIC_GATEWAY_URL!,
});

type State = {};

const acceptedProtocols: ClientProtocolId[] = [
  {
    id: "xmtp",
    version: "2024-02-01",
  },
  {
    id: "farcaster",
    version: "vNext",
  },
];

const reducer: FrameReducer<State> = (state, action) => {
  return {};
};

interface HomeProps {
  params: { id: string };
  searchParams: NextServerPageProps["searchParams"];
}

// This is a react server component only
export default async function Home({ params, searchParams }: HomeProps) {
  const previousFrame = getPreviousFrame<State>(searchParams);

  const initialState: State = {};

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

  const dbRef = ref(database, params.id);
  const snapshot = await get(dbRef);
  if (!snapshot.exists()) {
    throw new Error("No data available");
  }

  let donations: any = Object.values(snapshot.val().donations ?? {}) ?? [];
  donations = donations.reduce((acc: any, v: any) => {
    if (!acc[v.fid]) acc[v.fid] = 0;
    acc[v.fid] += v.value;
    return acc;
  }, {});
  donations = Object.entries(donations)
    .sort((x: any, y: any) => y[1] - x[1])
    .slice(0, 3);
  console.log(donations);
  donations = donations.map(async ([fid, value]: any) => {
    let name = "Unknown";
    try {
      name = (await fdk.getUserByFid(fid)).username;
    } catch (err) {}

    return {
      name: name,
      value: Math.round((value / ((1 / 3379.25) * 1e18)) * 100) / 100,
    };
  });
  for (let k in donations) {
    donations[k] = await donations[k];
  }

  return (
    <FrameContainer
      postUrl={`/${params.id}/stats`}
      pathname={`/${params.id}/stats`}
      state={state}
      previousFrame={previousFrame}
      accepts={acceptedProtocols}
    >
      <FrameImage aspectRatio="1.91:1">
        <div tw="w-full h-full bg-white flex flex-col">
          <div tw="bg-[#F1F1F1] text-black p-12 flex justify-between items-center">
            <h2 tw="mt-0 pt-0 mb-0 pb-0">Most Donations</h2>
          </div>
          <div tw="flex-col flex px-12 py-8">
            {donations.length === 0 && (
              <div tw="flex">No donations yet. Be the first!</div>
            )}
            {donations[0] && (
              <div tw="flex items-center">
                <h2 tw="mt-0 pt-0 mb-0 pb-0 mr-4">🥇</h2>
                <p>
                  {donations[0].name}: ${donations[0].value}{" "}
                </p>
              </div>
            )}
            {donations[1] && (
              <div tw="flex items-center">
                <h2 tw="mt-0 pt-0 mb-0 pb-0 mr-4">🥈</h2>
                <p>
                  {donations[1].name}: ${donations[0].value}{" "}
                </p>
              </div>
            )}
            {donations[2] && (
              <div tw="flex items-center">
                <h2 tw="mt-0 pt-0 mb-0 pb-0 mr-4">🥉</h2>
                <p>
                  {donations[2].name}: ${donations[2].value}{" "}
                </p>
              </div>
            )}
          </div>
        </div>
      </FrameImage>
      <FrameButton target={`${process.env.NEXT_PUBLIC_HOST}/${params.id}`}>
        Go Back
      </FrameButton>
    </FrameContainer>
  );
}
