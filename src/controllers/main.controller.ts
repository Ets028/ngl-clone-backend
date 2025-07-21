import { Request, Response } from "express";
import { prisma } from "../lib/db";

export const syncUser = async (req: Request, res: Response) => {
  const supabaseUser = req.user;

  if (!supabaseUser) {
    return res.status(401).json({ error: "No authenticated user found." });
  }

  const { id, email } = supabaseUser;
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required for sync." });
  }

  try {
    const user = await prisma.user.upsert({
      where: { id: id },
      update: {
        username: username.toLowerCase(),
        email: email,
      },
      create: {
        id: id,
        username: username.toLowerCase(),
        email: email,
      },
    });
    res.status(200).json({ message: "User synced successfully", user });
  } catch (error: any) {
    if (error.code === "P2002") {
      // Unique constraint failed (username)
      return res.status(409).json({ error: "Username is already taken." });
    }
    res.status(500).json({ error: "Failed to sync user." });
  }
};

// Fungsi untuk mengirim pertanyaan (tidak berubah secara fungsional)
export const createQuestion = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Question content cannot be empty" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await prisma.question.create({
      data: {
        content,
        userId: user.id,
      },
    });

    res.status(201).json({ message: "Question submitted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong while submitting the question" });
  }
};

export const getMyQuestions = async (req: Request, res: Response) => {
  const supabaseUser = req.user;

  if (!supabaseUser) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    const questions = await prisma.question.findMany({
      where: {
        userId: supabaseUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(questions);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong while fetching questions" });
  }
};
