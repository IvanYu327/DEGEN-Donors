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
import { DEFAULT_DEBUGGER_HUB_URL, createDebugUrl } from "./debug";
import { currentURL } from "./utils";
import Image from "next/image";

type State = {
  active: string;
  total_button_presses: number;
};

const initialState = { active: "1", total_button_presses: 0 };

const reducer: FrameReducer<State> = (state, action) => {
  return {
    total_button_presses: state.total_button_presses + 1,
    active: action.postBody?.untrustedData.buttonIndex
      ? String(action.postBody?.untrustedData.buttonIndex)
      : "1",
  };
};

// This is a react server component only
export default async function Home({ searchParams }: NextServerPageProps) {
  const url = currentURL("/");
  const previousFrame = getPreviousFrame<State>(searchParams);

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

  // then, when done, return next frame
  return (
    <div className="p-4">
      frames.js starter kit. The Template Frame is on this page, it&apos;s in
      the html meta tags (inspect source).{" "}
      <Link href={createDebugUrl(url)} className="underline">
        Debug
      </Link>{" "}
      or see{" "}
      <Link href="/examples" className="underline">
        other examples
      </Link>
      <FrameContainer
        postUrl="/frames"
        pathname="/"
        state={state}
        previousFrame={previousFrame}
      >
        {/* <FrameImage src="https://framesjs.org/og.png" /> */}
        <FrameImage aspectRatio="1.91:1">
          <div tw="w-full h-full bg-gray-200 flex flex-col">
            <div tw="bg-slate-700 text-white p-12 flex justify-between items-center">
              <div>Donate Now</div>
            </div>
            {/* Image, with title, and description to the right */}
            <div tw="flex flex-row">
              <div tw="flex flex-row">
                {/* <Image
                  src="/your-image.jpg"
                  alt="Your Image"
                  width={500}
                  height={500}
                /> */}
                <div tw="flex bg-gray-300 w-64 h-64"></div>
              </div>
              <div tw="flex flex-col">
                <h2>Title</h2>
                <p>Description</p>
              </div>
            </div>
            {/* Progress bar */}
            <div tw="flex flex-col items-center">
              <div tw="flex w-80/100 h-8 bg-red-500 rounded-lg overflow-hidden">
                <div
                  tw="flex bg-blue-500 h-full"
                  style={{ width: "70%" }}
                ></div>
                {/* Adjust width dynamically */}
              </div>
            </div>
            {/* $500 of $1000 raised left justified and 26 days left, right justified */}
            <div tw="flex justify-between px-12">
              <div>$500 of $1000 raised</div>
              <div>26 days left</div>
            </div>
          </div>
        </FrameImage>
        <FrameInput text="put some text here" />
        <FrameButton>
          {state?.active === "1" ? "Active" : "Inactive"}
        </FrameButton>
        <FrameButton>
          {state?.active === "2" ? "Active" : "Inactive"}
        </FrameButton>
        <FrameButton action="link" target={`https://www.google.com`}>
          External
        </FrameButton>
      </FrameContainer>
    </div>
  );
}
