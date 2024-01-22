/* -------- Requests -------- */

const getLanguages = async (owner, repo) => {
  try {
    const languageResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/languages`
    );

    const languages = await languageResponse.json();

    const languagesArray = [];
    for (let key in languages) languagesArray.push(key);

    return languagesArray;
  } catch (error) {
    return [];
  }
};

const getUser = async (username) => {
  const cachedUsername = window.localStorage.getItem("username");
  const cachedUserInfo = window.localStorage.getItem("userinfo");
  if (cachedUsername && cachedUserInfo && cachedUsername == username) {
    return JSON.parse(cachedUserInfo);
  }
  try {
    const userResponse = await fetch(
      `https://api.github.com/users/${username}`
    );

    const user = await userResponse.json();

    const userInfo = {
      avatar: user.avatar_url,
      totalRepoCount: user.public_repos,
      name: user.name,
      bio: user.bio,
      twitter: user.twitter_username,
      location: user.location,
      link: user.html_url,
    };

    window.localStorage.setItem("userinfo", JSON.stringify(userInfo));
    window.localStorage.setItem("username", username);

    return userInfo;
  } catch (error) {
    return null;
  }
};

const getUserRespositories = async (userName, per_page, page) => {
  try {
    const repositoriesResponse = await fetch(
      `https://api.github.com/users/${userName}/repos?per_page=${per_page}&page=${page}`
    );
    const repositories = await repositoriesResponse.json();

    const repos = [];
    for await (let repo of repositories) {
      const languages = await getLanguages(repo.owner.login, repo.name);
      repos.push({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        languages,
      });
    }

    return repos;
  } catch (error) {
    return [];
  }
};

/* -------- HANDLERS -------- */

async function handleSearch() {
  const urlParams = new URLSearchParams(window.location.search);
  const pageNumber = Number(urlParams.get("pageNumber")) || 1;
  const pageSize = Number(urlParams.get("pageSize")) || 10;
  let userName = urlParams.get("username");

  document.getElementById("username-input").value = userName;
  document.getElementById("page-size-input").value = pageSize;

  if (!userName) {
    userName = document.getElementById("username-input").placeholder;
  }

  document.getElementById("submit-button").setAttribute("disabled", true);
  document
    .getElementById("page-size-submit-button")
    .setAttribute("disabled", true);
  document.getElementById("spinner").style.display = "block";

  const user = await getUser(userName);

  if (!user || Object.keys(user).length === 0) {
    document.getElementById("user-not-found").style.display = "block";
  } else {
    const repos = await getUserRespositories(userName, pageSize, pageNumber);
    const userDetails = {
      details: user,
      repos,
    };
    document.getElementById("user-not-found").style.display = "none";
    setUserProfile(userDetails);
    setRepositories(userDetails);
    setPagination(userDetails, pageSize, pageNumber, userName);
  }

  document.getElementById("submit-button").removeAttribute("disabled");
  document
    .getElementById("page-size-submit-button")
    .removeAttribute("disabled");
  document.getElementById("spinner").style.display = "none";
}

const handleSubmit = () => {
  const userName = document.getElementById("username-input").value;
  // const url = window.location.href;
  // if (url.includes("?") == true) {
  //   window.location.replace(`?username=${userName}&pageNumber=1&pageSize=10`);
  // } else {
  //   url = url + `?username=${userName}&pageNumber=1&pageSize=10`;
  //   window.location.href = url;
  // }
  window.location.search = `?username=${userName}&pageNumber=1&pageSize=10`
};

const handlePageSizeSubmit = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get("username");
  const pageSize = document.getElementById("page-size-input").value;
  window.location.search = `?username=${userName}&pageNumber=1&pageSize=${pageSize}`
};

/* --------- DOM -------*/

const setUserProfile = async (user) => {
  document.getElementById("username").innerHTML = user.details.name;
  document.getElementById("avatar").src = user.details.avatar;

  const userDetailsContainer = document.getElementById("user-details");
  userDetailsContainer.replaceChildren();

  const toShow = ["name", "bio", "twitter", "location", "link"];

  toShow.forEach((key) => {
    if (user.details[key]) {
      const detailsContainer = document.createElement("div");
      detailsContainer.setAttribute("class", "userDetails");
      const keyText = document.createTextNode(`${key.toUpperCase()}: `);
      const boldContainer = document.createElement("b");
      boldContainer.appendChild(keyText);
      detailsContainer.appendChild(boldContainer);
      if (key == "link" || key == "twitter") {
        const valueLink = document.createElement("a");
        valueLink.innerHTML = user.details[key];
        valueLink.href = user.details[key];
        valueLink.target = "_blank";
        detailsContainer.appendChild(valueLink);
      } else {
        const valueText = document.createTextNode(user.details[key]);
        detailsContainer.appendChild(valueText);
      }
      userDetailsContainer.appendChild(detailsContainer);
    }
  });
};

const setRepositories = (user) => {
  const reposContainer = document.getElementById("user-repositories");
  reposContainer.replaceChildren();

  user.repos.forEach((repo) => {
    const repoContainer = document.createElement("div");
    repoContainer.setAttribute("class", "repo");

    // Repo Link
    const repoLink = document.createElement("a");
    repoLink.appendChild(document.createTextNode(repo.name || ""));
    repoLink.setAttribute("href", repo.url || "");
    repoLink.setAttribute("target", "_blank");

    // Repo Name
    const repoName = document.createElement("h4");
    repoName.appendChild(repoLink);
    repoContainer.appendChild(repoName);

    // Repo Description
    const repoDesc = document.createElement("p");
    repoDesc.appendChild(document.createTextNode(repo.description || ""));
    repoContainer.appendChild(repoDesc);

    // Languages
    repo.languages.forEach((lang) => {
      const language = document.createElement("span");
      language.setAttribute("class", "badge badge-pill badge-primary lang");
      language.appendChild(document.createTextNode(lang));
      repoContainer.appendChild(language);
    });

    reposContainer.appendChild(repoContainer);
  });
};

const setPagination = (user, pageSize, pageNumber, userName) => {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.replaceChildren();

  let page = 1;

  const paginationListPrev = document.createElement("li");
  paginationListPrev.setAttribute("class", "page-item pagination");
  const paginationNumberPrev = document.createElement("a");
  paginationNumberPrev.setAttribute(
    "class",
    `page-link ${pageNumber - 1 <= 0 && "disabled"}`
  );
  paginationNumberPrev.appendChild(document.createTextNode("<< Older"));
  paginationNumberPrev.href = `?username=${userName}&pageNumber=${
    pageNumber - 1
  }&pageSize=${pageSize}`;
  paginationListPrev.appendChild(paginationNumberPrev);

  paginationContainer.appendChild(paginationListPrev);

  for (let i = 0; i < user.details.totalRepoCount; i = i + pageSize, page++) {
    const paginationList = document.createElement("li");
    paginationList.setAttribute("class", "page-item pagination");
    const paginationNumber = document.createElement("a");
    paginationNumber.setAttribute(
      "class",
      `page-link ${page == pageNumber && "active"}`
    );
    paginationNumber.appendChild(document.createTextNode(page));
    paginationNumber.href = `?username=${userName}&pageNumber=${page}&pageSize=${pageSize}`;
    paginationList.appendChild(paginationNumber);

    paginationContainer.appendChild(paginationList);
  }

  const paginationListNext = document.createElement("li");
  paginationListNext.setAttribute("class", "page-item pagination");
  const paginationNumberNext = document.createElement("a");
  paginationNumberNext.setAttribute(
    "class",
    `page-link ${pageNumber + 1 >= page && "disabled"}`
  );
  paginationNumberNext.appendChild(document.createTextNode("Newer >>"));
  paginationNumberNext.href = `?username=${userName}&pageNumber=${
    pageNumber + 1
  }&pageSize=${pageSize}`;
  paginationListNext.appendChild(paginationNumberNext);

  paginationContainer.appendChild(paginationListNext);
};

/* ------ Listeners -------- */
document
  .getElementById("submit-button")
  .addEventListener("click", handleSubmit);

document
  .getElementById("page-size-submit-button")
  .addEventListener("click", handlePageSizeSubmit);

handleSearch();
