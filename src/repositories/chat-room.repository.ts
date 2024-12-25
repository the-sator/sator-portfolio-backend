import prisma from "@/loaders/prisma";
import type { InviteChatMember } from "@/types/chat-member.type";
import type {
  ChangeChatRoomName,
  CreateChatRoom,
} from "@/types/chat-room.type";
import type { Prisma } from "@prisma/client";

export class ChatRoomRepository {
  public async findAll() {
    return await prisma.chatRoom.findMany({
      orderBy: {
        updated_at: "desc",
      },
      include: {
        last_message: {
          include: {
            chat_member: {
              include: {
                user: {
                  omit: {
                    password: true,
                    totp_key: true,
                  },
                },
                admin: {
                  omit: {
                    password: true,
                    totp_key: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  public async findUserChatRoom(user_id: string) {
    return await prisma.chatRoom.findMany({
      orderBy: {
        updated_at: "desc",
      },
      include: {
        last_message: {
          include: {
            chat_member: {
              include: {
                user: {
                  omit: {
                    password: true,
                    totp_key: true,
                  },
                },
                admin: {
                  omit: {
                    password: true,
                    totp_key: true,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        chat_members: {
          some: {
            user_id: {
              startsWith: user_id,
            },
          },
        },
      },
    });
  }

  public async findById(id: string) {
    return await prisma.chatRoom.findFirst({
      where: { id },
      include: {
        last_message: {
          include: {
            chat_member: {
              include: {
                user: {
                  omit: {
                    password: true,
                    totp_key: true,
                  },
                },
                admin: {
                  omit: {
                    password: true,
                    totp_key: true,
                  },
                },
              },
            },
          },
        },
        chat_members: {
          where: {
            left_at: null,
          },
          orderBy: {
            role: "asc",
          },
          include: {
            admin: {
              omit: {
                password: true,
                totp_key: true,
              },
            },
            user: {
              omit: {
                password: true,
                totp_key: true,
              },
            },
          },
        },
      },
    });
  }

  public async create(payload: CreateChatRoom, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.chatRoom.create({
      data: {
        name: payload.name,
        is_group: payload.is_group || false,
      },
      include: {
        last_message: true,
      },
    });
  }

  public async changeName(
    id: string,
    payload: ChangeChatRoomName,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.chatRoom.update({
      data: {
        name: payload.name,
      },
      where: { id },
    });
  }

  public async bumpToLatest(
    id: string,
    last_message_id?: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.chatRoom.update({
      data: {
        updated_at: new Date(),
        last_message_id,
      },
      include: {
        last_message: {
          include: {
            chat_member: {
              include: {
                user: {
                  omit: {
                    password: true,
                    totp_key: true,
                  },
                },
                admin: {
                  omit: {
                    password: true,
                    totp_key: true,
                  },
                },
              },
            },
          },
        },
      },
      where: { id },
    });
  }
}
