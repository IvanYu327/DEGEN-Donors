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
import { DEFAULT_DEBUGGER_HUB_URL, createDebugUrl } from "../../../debug";
import { currentURL } from "../../../utils";

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
    console.log('CCCC', action)
    return {};
};

interface HomeProps {
    params: { id: string };
    searchParams: NextServerPageProps["searchParams"];
}

// This is a react server component only
export default async function Home({ params, searchParams }: HomeProps) {
    const previousFrame = getPreviousFrame<State>(searchParams);

    console.log('BBBB', previousFrame)

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

    const txId = frameMessage?.transactionId ?? ""

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
