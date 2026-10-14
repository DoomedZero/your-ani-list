const userName = "DoomedZero";
const url = "https://graphql.anilist.co";

const query = `
  query ($userName: String) {
    MediaListCollection(userName: $userName, type: ANIME) {
      lists {
        entries {
          status
          media {
            title {
              romaji
              english
            }
            coverImage {
              large
            }
          }
        }
      }
    }
  }
`;

export async function fetchAnimeLists() {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query,
            variables: { userName }
        })
    });

    if (!response.ok) {
        throw new Error(`AniList request failed: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
        throw new Error("AniList returned an API error.");
    }

    const lists = result.data.MediaListCollection.lists;

    const getListByStatus = (status) =>
        lists.flatMap((list) =>
            list.entries.filter((entry) => entry.status === status)
        );

    return {
        completedList: getListByStatus("COMPLETED"),
        planningList: getListByStatus("PLANNING")
    };
}