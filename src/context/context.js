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
  const [isLoading, setIsLoading] = useState(false);
  //error
  const [error, setError] = useState({ show: false, msg: "" });

  const checkRequestsLimit = async () => {
    try {
      const { data } = await axios.get(`${rootUrl}/rate_limit`);
      let {
        rate: { remaining },
      } = data;
      setRequest(remaining);
      if (remaining === 0) {
        //throw an error
        toggleError(true, "sorry you have exceeded your hourly rate limit!");
      }
    } catch (error) {
      console.error(error);
    }
  };
  //error
  function toggleError(show = false, msg = "") {
    setError({ show, msg });
  }
  const searchGithubUser = async (user) => {
    toggleError();
    setIsLoading(true);
    try {
      const response = await axios.get(`${rootUrl}/users/${user}`);
      if (response) {
        //https://api.github.com/users/john-smilga/repos?per_page=100
        //https://api.github.com/users/john-smilga/followers
        setGithubUser(response.data);
        const { login, followers_url } = response.data;
        try {
          const response = await axios.get(
            `${rootUrl}/users/${login}/repos?per_page=100`
          );
        } catch (error) {
          console.error(error);
        }
        try {
          const response = await axios.get(`${followers_url}?per_page=100`);
          setFollowers(response.data);
        } catch (error) {
          console.error(error);
        }
      }
      setIsLoading(false);
      checkRequestsLimit();
    } catch (error) {
      toggleError(true, "there is no user with that username");
    }
  };
  useEffect(() => {
    checkRequestsLimit();
  });
  return (
    <GithubContext.Provider
      value={{
        request,
        githubUser,
        repos,
        followers,
        error,
        searchGithubUser,
        isLoading,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export { GithubContext, GithubProvider };
