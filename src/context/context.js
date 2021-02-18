import React, { useState, useEffect } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import axios from "axios";

const rootUrl = "https://api.github.com";

const GithubContext = React.createContext();

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);
  //requests and loading
  const [request, setRequest] = useState(0);
  const [loading, setIsLoading] = useState(false);

  const checkRequestsLimit = async () => {
    try {
      const { data } = await axios.get(`${rootUrl}/rate_limit`);
      let {
        rate: { remaining },
      } = data;
      setRequest(remaining);
      if (remaining === 0) {
        //throw an error
      }
    } catch (error) {
      console.error(error);
    }
  };
  //errors
  useEffect(() => {
    checkRequestsLimit();
  }, []);
  return (
    <GithubContext.Provider value={{ request, githubUser, repos, followers }}>
      {children}
    </GithubContext.Provider>
  );
};

export { GithubContext, GithubProvider };
