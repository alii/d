import type { GetServerSideProps, GetStaticProps, NextPage } from "next";
import { useState, useEffect } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";

import fetchGithub from "../src/fetch/github";
import fetchTwitter from "../src/fetch/twitter";

interface Props {
    // TODO(@cnrad): Type these!!
    twitterInfo: any;
    githubInfo: any;
}

export const getServerSideProps: GetServerSideProps<Props> = async ctx => {
    const query = (ctx.query as Partial<Record<"github" | "twitter", string>>) ?? {};

    const twitterInfo = JSON.parse(await fetchTwitter(query.twitter ? query.twitter : "notcnrad"));
    const githubInfo = JSON.parse(await fetchGithub(query.github ? query.github : "cnrad"));

    return {
        props: {
            twitterInfo,
            githubInfo,
        },
    };
};

const Home: NextPage<Props> = ({ twitterInfo, githubInfo }) => {
    const [twitter, setTwitterInfo] = useState(twitterInfo);
    const [github, setGithubInfo] = useState(githubInfo);
    const [updatedTimestamp, setUpdatedTimestamp] = useState(new Date().toLocaleString());
    const [dc, setDc] = useState(0);

    const router = useRouter();
    const params = router.query as {
        github?: string;
        twitter?: string;
        discord?: string;
    };

    const twitterUsername = params.twitter !== undefined ? params.twitter : "notcnrad";
    const githubUsername = params.github !== undefined ? params.github : "notcnrad";
    const discordID = params.discord !== undefined ? params.discord : "705665813994012695";

    useEffect(() => {
        const interval = setInterval(async () => {
            const newTwitter = await fetch(`/api/twitter?user=${twitterUsername}`);
            const newGithub = await fetch(`/api/github?user=${githubUsername}`);

            setTwitterInfo(await newTwitter.json());
            setGithubInfo(await newGithub.json());

            setUpdatedTimestamp(new Date().toLocaleString());
            setDc(old => old + 1);
        }, 10 * 60 * 1000);

        return () => {
            clearInterval(interval);
        };
    }, [githubUsername, twitterUsername]);

    return (
        <Page>
            <Main>
                <SectionBox>
                    <SectionTitle>TWITTER</SectionTitle>
                    <SectionProfile>
                        <Avatar src={`https://unavatar.io/twitter/${twitterUsername}`} alt="Twitter Profile Picture" />
                        <ProfileTitle>
                            {twitter.name} <br />
                            <span style={{ color: "#bbb" }}>(@{twitterUsername})</span>
                        </ProfileTitle>
                    </SectionProfile>
                    <SectionInfo>
                        FOLLOWERS
                        <SectionStat color={"#2462AF"}>{twitter.followers}</SectionStat>
                    </SectionInfo>
                </SectionBox>

                <SectionBox>
                    <SectionTitle>GITHUB</SectionTitle>
                    <SectionProfile>
                        <Avatar src={github.avatar} alt="GitHub Profile Picture" />
                        <ProfileTitle>
                            {github.name} <br />
                            <span style={{ color: "#bbb" }}>({githubUsername})</span>
                        </ProfileTitle>
                    </SectionProfile>
                    <SectionContent>
                        <SectionInfo>
                            FOLLOWERS
                            <SectionStat color={"#70a7ff"}>{github.followers}</SectionStat>
                        </SectionInfo>

                        <SectionInfo>
                            FOLLOWING
                            <SectionStat color={"#3234a8"}>{github.following}</SectionStat>
                        </SectionInfo>

                        <SectionInfo>
                            STARS<SectionStat color={"#e5ff70"}>{github.stars}</SectionStat>
                        </SectionInfo>

                        <SectionInfo>
                            REPOS
                            <SectionStat color={"#7eff70"}>{github.repos}</SectionStat>
                        </SectionInfo>
                    </SectionContent>
                </SectionBox>

                <SectionBox style={{ width: "28.5rem", height: "17rem" }}>
                    <SectionTitle style={{ margin: 0 }}>DISCORD</SectionTitle>
                    <img
                        style={{ width: "100%", height: "100%" }}
                        src={`https://lanyard-profile-readme.vercel.app/api/${discordID}?hideTimestamp=true&idleMessage=Just%20chillin...&bg=181c2f&borderRadius=0.35rem&v=${dc}`}
                        alt="Discord Status"
                    />
                </SectionBox>
            </Main>
            <LastUpdated>Last Updated on {updatedTimestamp}</LastUpdated>
        </Page>
    );
};

const Page = styled.div`
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const Header = styled.h1`
    font-size: 1.75rem;
    color: #4f5c95;
    font-weight: 700;
    letter-spacing: 0.05rem;
    border-bottom: 2px #4f5c95 solid;
    padding-bottom: 0.05rem;
`;

const Main = styled.div`
    width: auto;
    height: auto;
    display: grid;
    grid-template-columns: 22rem 22rem;

    @media (max-width: 1000px) {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    @media (max-height: 700px) {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }
`;

const SectionBox = styled.div`
    font-family: Open Sans;
    width: 20rem;
    height: auto;
    background: #181c2f;
    color: #fff;
    border-radius: 0.35rem;
    filter: drop-shadow(2px 2px 5px rgba(0, 0, 0, 0.1));
    padding: 1.5rem;
    margin: 0.75rem;
`;

const SectionTitle = styled.h1`
    letter-spacing: 0.05rem;
    color: #8a8d96;
    height: auto;
    width: 100%;
    font-size: 0.85rem;
    margin: 0 0 1rem 0;
    text-transform: uppercase;
`;

const SectionProfile = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    font-size: 1rem;
    margin-bottom: 1.5rem;
`;

const Avatar = styled.img`
    width: 4rem;
    height: 4rem;
    border-radius: 0.75rem;
    margin-right: 1rem;
`;

const ProfileTitle = styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
    font-size: 1rem;
`;

const SectionContent = styled.div`
    width: 100%;
    height: auto;
    display: grid;
    grid-template-columns: 50% 50%;
`;

const SectionInfo = styled.div`
    color: #c6c6c6;
    height: auto;
    width: auto;
    padding-right: 2rem;
    font-size: 0.9rem;
    letter-spacing: 0.05rem;
    margin: 0;
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    font-weight: 600;
    text-transform: uppercase;
`;

const SectionStat = styled.div<{ color: string }>`
    color: #fff;
    font-size: 2rem;
    font-weight: 400;
    filter: drop-shadow(0 0 4px ${({ color }) => color});
`;

const LastUpdated = styled.div`
    letter-spacing: 0.05rem;
    color: #4c5777;
    height: auto;
    font-size: 0.85rem;
    font-weight: 700;
    padding: 1rem 0;
`;

export default Home;
