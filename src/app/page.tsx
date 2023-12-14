import getCurrentUser from "./actions/getCurrentUser";
import { Landing } from "../../components/landing";
import NavBar from "../../components/navBar";
import { MessagesLanding } from "../../components/messagesLanding";
import StatsLanding from "../../components/statsLanding";
import AboutLanding from "../../components/aboutLanding";
import Footer from "../../components/footer";

export default async function Home() {
  const currentUser = await getCurrentUser();

  return (
    <>
      <div className="bg-blue-00" data-testid="home-page-root">
        <NavBar currentUser={currentUser!} data-testid="navBar" />
        <Landing currentUser={currentUser!} />
        <MessagesLanding />
        <AboutLanding />
        <StatsLanding />
        <Footer />
      </div>
    </>
  );
}
