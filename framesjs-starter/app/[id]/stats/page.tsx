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
  pinata_jwt:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlYzU3N2RmMS0wMDE5LTRjYzUtYTc5Mi02ZmYzMGNmZGVjOTQiLCJlbWFpbCI6Imphc29udzM2NTE1MTYwNUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMjk5ZWM5YmI0NzJmNDE1NDNmNDMiLCJzY29wZWRLZXlTZWNyZXQiOiI5NGNmYzRlY2U4MWNiY2U2Y2Y0YmI3YWQwZmYzOTljYmQ0OTU0MGM0ODEyZmRlNzczMDU4YTdkMmI1NzQzMjYxIiwiaWF0IjoxNzExMjcwMDYyfQ.kiAKLaZltjstI2PES9n4zKv5lqtxnJ7MM-Bi5wj7VtY",
  pinata_gateway: "black-bizarre-newt-694.mypinata.cloud",
});

type State = {};

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
        <div tw="flex">Most Donations</div>
        {donations[0] && (
          <div tw="flex">
            1. {donations[0].name}: ${donations[0].value}
          </div>
        )}
        {donations[1] && (
          <div tw="flex">
            2. {donations[1].name}: ${donations[1].value}
          </div>
        )}
        {donations[2] && (
          <div tw="flex">
            3. {donations[2].name}: ${donations[2].value}
          </div>
        )}
      </FrameImage>
      <FrameButton target={`${process.env.NEXT_PUBLIC_HOST}/${params.id}`}>
        Go Back
      </FrameButton>
    </FrameContainer>
  );
}
