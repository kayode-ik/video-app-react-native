import { Alert } from "react-native";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
} from "react-native-appwrite";
export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.jsm.zenify02",
  projectId: "667e89750034aac32a97",
  databaseId: "667eb3fd003255e2c6d6",
  userCollectionId: "667eb414002d8bb35383",
  videoCollectionId: "667eb42a00317f0a1790",
  storageId: "667eb8340029f921649f",
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId,
} = config;

// Init your React Native SDK
const client = new Client();

client
  .setEndpoint(endpoint) // Your Appwrite Endpoint
  .setProject(projectId) // Your project ID
  .setPlatform(platform); // Your application ID or bundle ID.

const account = new Account(client);
const databases = new Databases(client);
const avatars = new Avatars(client);

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avataUrl = avatars.getInitials(username);

    // console.log("inside sign up function, Got here before failing;");
    await Login(email, password);

    // console.log(
    //   "inside sign up function after Login function, Got here before failing;"
    // );

    const newUser = await databases.createDocument(
      databaseId,
      userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avataUrl,
      }
    );

    return newUser;
  } catch (error) {
    Alert.alert("Error", error.message);

    // console.log(error);
    throw new Error(error);
  }
};

export const Login = async (email, password) => {
  //   try {
  //     const session = await account.createEmailPasswordSession(email, password);

  //     return session;
  //   } catch (error) {
  //     console.log(error);
  //     throw new Error(error);
  //   }

  try {
    // console.log("i entered Login function");
    // const sessions = await account.listSessions();
    // console.log(sessions + "sessions list");
    // if (sessions.sessions.length > 0) {
    //   // Use the existing session if there is already an active one
    //   console.log(sessions.sessions[0], "session");
    //   return sessions.sessions[0];
    // }
    // console.log("inside login function, Got here before failing");
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    // Handle specific error related to missing scope
    if (error.message.includes("missing scope (account)")) {
      // console.log("User missing required scope: account");
      // Handle the specific case where the user does not have the required scope
      // This may involve prompting the user to log in or providing an appropriate message
    } else {
      // console.log("An error occurred during login:", error.message);
    }
    throw new Error(error.message);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    // console.log(error);
    Alert.alert("Error", error.message);
  }
};

export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.limit(100),
    ]);

    return posts.documents;
  } catch (error) {
    //  console.log(error);
    throw new Error(error);
  }
};

export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc(`$createdAt`, Query.limit(7)),
    ]);

    return posts.documents;
  } catch (error) {
    //  console.log(error);
    throw new Error(error);
  }
};

export const searchPosts = async (query) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.search("title", query),
    ]);

    return posts.documents;
  } catch (error) {
    //  console.log(error);
    throw new Error(error);
  }
};
export const getUserPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.equal("creator", userId),
    ]);

    return posts.documents;
  } catch (error) {
    //  console.log(error);
    throw new Error(error);
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error);
  }
};
