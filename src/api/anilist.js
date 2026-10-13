const userName = "DoomedZero"
const url = "https://graphql.anilist.co";
const variables = {
    userName: userName
};

const query = `query ($userName: String) {
  MediaListCollection(userName: $userName, type: ANIME) {
    lists {
      entries {
        status
        media {
          title {
            romaji
            english
          }
          coverImage{
            large
          }
        }
      }
    }
  }
}`

const response = await fetch(url, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        query: query,
        variables: variables
    })
});

const data = await response.json();

const lists = data.data.MediaListCollection.lists;
console.log(lists);

const getListByStatus = (status) =>
  lists.flatMap((list) => list.entries.filter((entry) => entry.status === status))

const completedList = getListByStatus("COMPLETED");

const planningList = getListByStatus("PLANNING");

console.log(completedList)
console.log(planningList)


export { completedList, planningList };