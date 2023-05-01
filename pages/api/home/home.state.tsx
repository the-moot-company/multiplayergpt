import { Conversation, Message } from '@/types/chat';
import { ErrorMessage } from '@/types/error';
import { FolderInterface } from '@/types/folder';
import { OpenAIModel, OpenAIModelID } from '@/types/openai';
import { PluginKey } from '@/types/plugin';
import { Prompt } from '@/types/prompt';

export interface HomeInitialState {
  apiKey: string;
  pluginKeys: PluginKey[];
  loading: boolean;
  lightMode: 'light' | 'dark';
  messageIsStreaming: boolean;
  modelError: ErrorMessage | null;
  models: OpenAIModel[];
  folders: FolderInterface[];
  conversations: Conversation[];
  selectedConversation: Conversation | undefined;
  currentMessage: Message | undefined;
  prompts: Prompt[];
  temperature: number;
  showChatbar: boolean;
  showPromptbar: boolean;
  currentFolder: FolderInterface | undefined;
  messageError: boolean;
  searchTerm: string;
  defaultModelId: OpenAIModelID | undefined;
  serverSideApiKeyIsSet: boolean;
  serverSidePluginKeysSet: boolean;
  roomId: string | undefined;
  name: string | undefined;
  userColor: string;
  isLoginModalOpen: boolean;
}
// Array of Animals
const animals = [
  'Giraffe',
  'Koala',
  'Cheetah',
  'Penguin',
  'Dolphin',
  'Sloth',
  'Elephant',
  'Tiger',
  'Octopus',
  'Kangaroo',
  'Lion',
  'Gorilla',
  'PolarBear',
  'Flamingo',
  'Ostrich',
  'Chimpanzee',
  'Zebra',
  'Orangutan',
  'Hippopotamus',
  'Peacock',
];

// Array of Adjectives
const adjectives = [
  'Majestic',
  'Playful',
  'Graceful',
  'Fierce',
  'Curious',
  'Adorable',
  'Energetic',
  'Enchanting',
  'Wise',
  'Agile',
  'Colorful',
  'Lively',
  'Powerful',
  'Gentle',
  'Mysterious',
  'Elegant',
  'Quirky',
  'Regal',
  'Silly',
  'Vibrant',
];

const randomAnimal =
  adjectives[Math.floor(Math.random() * animals.length)] +
  animals[Math.floor(Math.random() * animals.length)] +
  Math.floor(Math.random() * 50);

const userColors = [
  '#FF7262',
  '#F5BD80',
  '#F8DC61',
  '#CDF87F',
  '#94B1F5',
  '#C2C7F4',
  '#F6DBE1',
  '#EDF0F5',
];
const randomColor = userColors[Math.floor(Math.random() * userColors.length)];

//
export const initialState: HomeInitialState = {
  apiKey: '',
  loading: false,
  pluginKeys: [],
  lightMode: 'light',
  messageIsStreaming: false,
  modelError: null,
  models: [],
  folders: [],
  conversations: [],
  selectedConversation: undefined,
  currentMessage: undefined,
  prompts: [],
  temperature: 1,
  showPromptbar: true,
  showChatbar: true,
  currentFolder: undefined,
  messageError: false,
  searchTerm: '',
  defaultModelId: undefined,
  serverSideApiKeyIsSet: false,
  serverSidePluginKeysSet: false,
  roomId: undefined,
  name: randomAnimal,
  userColor: randomColor,
};
