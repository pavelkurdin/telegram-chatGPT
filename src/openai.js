import { Configuration, OpenAIApi } from "openai";
import config from "config";
import { createReadStream } from "fs";

class openAI {
  roles = {
    SYSTEM: "system",
    USER: "user",
    ASSISTANT: "assistant",
  };

  constructor(openAIKey) {
    const configuration = new Configuration({
      apiKey: openAIKey,
    });
    this.openai = new OpenAIApi(configuration);
  }
  async chat(messages) {
    try {
      const response = await this.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages,
      });
      return response.data.choices[0].message;
    } catch (e) {
      console.log("error while getting response " + e.message);
    }
  }
  async transcription(url) {
    try {
      const response = await this.openai.createTranscription(
        createReadStream(url),
        "whisper-1"
      );
      return response.data.text;
    } catch (e) {
      console.log("error while getting transcription " + e.message);
    }
  }
}

export const openai = new openAI(config.get("OPENAI_API_KEY"));
