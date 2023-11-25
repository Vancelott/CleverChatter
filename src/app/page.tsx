import getCurrentUser from "./actions/getCurrentUser";
import { Landing } from "../../components/landing";
import NavBar from "../../components/navBar";
import { MessagesLanding } from "../../components/messagesLanding";
import StatsLanding from "../../components/statsLanding";
import AboutLanding from "../../components/aboutLanding";

export default async function Home() {
  const currentUser = await getCurrentUser();

  const showProfileMenu = async (show: boolean) => {
    const data = show;

    return data;
  };

  const show = await showProfileMenu;

  return (
    <>
      <div className="bg-blue-00">
        <NavBar currentUser={currentUser!} />
        <Landing currentUser={currentUser!} />
        <MessagesLanding />
        <AboutLanding />
        <StatsLanding />
      </div>
    </>
  );
}
