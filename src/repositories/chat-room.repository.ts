import { LIMIT } from "@/constant/base";
import prisma from "@/loaders/prisma";
import type { InviteChatMember } from "@/types/chat-member.type";
import type {
  ChangeChatRoomName,
  ChatRoomFilter,
  CreateChatRoom,
} from "@/types/chat-room.type";
import type { Prisma } from "@prisma/client";

export class ChatRoomRepository {
  private buildFilter = (filter: ChatRoomFilter) => {
    const where: Record<string, any> = {};
    if (filter.chat_room_name) {
      where.name = {
        contains: filter.chat_room_name,
        mode: "insensitive",
      };
    }
    return where;
  };
  public async findAll(filter: ChatRoomFilter) {
    const where = this.buildFilter(filter);
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.limit ? Number(filter.limit) : LIMIT;
    return await prisma.chatRoom.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        updated_at: "desc",
      },

      where,
      include: {
        unread_messages: {
          include: {
            chat_member: true,
          },
        },
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

  public async findUserChatRoom(user_id: string, filter: ChatRoomFilter) {
    const where = this.buildFilter(filter);
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.limit ? Number(filter.limit) : LIMIT;

    return await prisma.chatRoom.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        updated_at: "desc",
      },
      include: {
        unread_messages: {
          include: {
            chat_member: true,
          },
        },
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
        name: where.name,
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

  public async findById(id: string, filter: ChatRoomFilter) {
    const where = this.buildFilter(filter);
    return await prisma.chatRoom.findFirst({
      where: { id, name: where.name },
      include: {
        unread_messages: {
          include: {
            chat_member: true,
          },
        },
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

  public async findByAuthId(auth_id: string) {
    return prisma.chatRoom.findMany({
      where: {
        chat_members: {
          some: {
            user_id: auth_id,
            admin_id: auth_id,
          },
        },
      },
    });
  }

  public async count(filter?: ChatRoomFilter) {
    const where = this.buildFilter(filter || {});
    return await prisma.chatRoom.count({
      where,
    });
  }

  public async countUser(user_id: string, filter?: ChatRoomFilter) {
    const where = this.buildFilter(filter || {});
    return await prisma.chatRoom.count({
      where: {
        name: where.name,
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

  public async create(payload: CreateChatRoom, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.chatRoom.create({
      data: {
        name: payload.name,
        is_group: payload.is_group || false,
      },
      include: {
        unread_messages: {
          include: {
            chat_member: true,
          },
        },
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
        unread_messages: {
          include: {
            chat_member: true,
          },
        },
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
