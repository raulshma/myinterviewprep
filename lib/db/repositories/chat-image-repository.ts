import { ObjectId } from "mongodb";
import { getChatImagesCollection } from "../collections";
import type { ChatImage, CreateChatImage } from "../schemas/chat-image";

export interface ChatImageRepository {
  create(image: CreateChatImage): Promise<ChatImage>;
  createMany(images: CreateChatImage[]): Promise<ChatImage[]>;
  findById(id: string): Promise<ChatImage | null>;
  findByIds(ids: string[]): Promise<ChatImage[]>;
  findByMessageId(messageId: string): Promise<ChatImage[]>;
  findByConversationId(conversationId: string): Promise<ChatImage[]>;
  deleteByConversationId(conversationId: string): Promise<void>;
  deleteByMessageId(messageId: string): Promise<void>;
}

export const chatImageRepository: ChatImageRepository = {
  async create(image) {
    const collection = await getChatImagesCollection();
    const now = new Date();

    const doc: ChatImage = {
      _id: new ObjectId().toString(),
      ...image,
      createdAt: now,
    };

    await collection.insertOne(doc);
    return doc;
  },

  async createMany(images) {
    if (images.length === 0) return [];
    
    const collection = await getChatImagesCollection();
    const now = new Date();

    const docs: ChatImage[] = images.map((image) => ({
      _id: new ObjectId().toString(),
      ...image,
      createdAt: now,
    }));

    await collection.insertMany(docs);
    return docs;
  },

  async findById(id) {
    const collection = await getChatImagesCollection();
    const image = await collection.findOne({ _id: id });
    return image as ChatImage | null;
  },

  async findByIds(ids) {
    if (ids.length === 0) return [];
    
    const collection = await getChatImagesCollection();
    const images = await collection.find({ _id: { $in: ids } }).toArray();
    return images as ChatImage[];
  },

  async findByMessageId(messageId) {
    const collection = await getChatImagesCollection();
    const images = await collection.find({ messageId }).toArray();
    return images as ChatImage[];
  },

  async findByConversationId(conversationId) {
    const collection = await getChatImagesCollection();
    const images = await collection.find({ conversationId }).toArray();
    return images as ChatImage[];
  },

  async deleteByConversationId(conversationId) {
    const collection = await getChatImagesCollection();
    await collection.deleteMany({ conversationId });
  },

  async deleteByMessageId(messageId) {
    const collection = await getChatImagesCollection();
    await collection.deleteMany({ messageId });
  },
};
