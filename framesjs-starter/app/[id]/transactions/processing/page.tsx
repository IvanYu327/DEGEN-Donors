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
import { DEFAULT_DEBUGGER_HUB_URL, createDebugUrl } from "../../../debug";
import { initializeApp } from "firebase/app";
import { get, getDatabase, ref, set, push } from "firebase/database";

const web3 = new Web3("https://base-sepolia.g.alchemy.com/v2/52yhabS9hItelQz4l5GhiuVZUFnF4DOf");

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

    const initialState: State = {}

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

    const txId = frameMessage?.transactionId

    if (!txId) {
        return (
            <FrameContainer
                postUrl={`/${params.id}/transactions/processing`}
                pathname={`/${params.id}/transactions/processing`}
                state={state}
                previousFrame={previousFrame}
                accepts={acceptedProtocols}>
                <FrameImage aspectRatio="1.91:1">
                    <div tw="flex">No Transaction Found</div>
                </FrameImage>
                <FrameButton
                    target={`http://localhost:3000/${params.id}`}>
                    Go Back
                </FrameButton>
            </FrameContainer>
        )
    }

    const processTransaction = async (i: number) => {
        try {
            const txDetail = await web3.eth.getTransaction(txId);

            const dbRef = ref(database, params.id);
            const snapshot = await get(dbRef);
            if (!snapshot.exists()) {
                throw new Error("No data available");
            }

            const { donations } = snapshot.val();
            if (Object.values(donations ?? {}).some((d: any) => d.txId == txId)) {
                console.log(`Transaction id ${txId} already recorded for this charity`)
                return
            }

            await push(ref(database, `${params.id}/donations`), {
                txId,
                address: txDetail.from,
                value: Number(txDetail?.value ?? 0)
            })
        } catch (err) {
            console.log(err)
            if (i + 1 < 5) setTimeout(() => processTransaction(i + 1), 2000)
        }
    }
    setTimeout(() => processTransaction(0), 2000)

    return (
        <FrameContainer
            postUrl={`/${params.id}/transactions/processing`}
            pathname={`/${params.id}/transactions/processing`}
            state={state}
            previousFrame={previousFrame}
            accepts={acceptedProtocols}>
            <FrameImage aspectRatio="1.91:1">
                <div tw="flex">Processing Transaction</div>
                <div tw="flex">{txId.substring(0, 6) + "..." + txId.substring(txId.length - 6)}</div>
            </FrameImage>
            <FrameButton
                target={`http://localhost:3000/${params.id}`}>
                Go Back
            </FrameButton>
        </FrameContainer>
    );
}
