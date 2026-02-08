import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Verificar se já existe algum usuário
    const userCount = await prisma.user.count();

    return NextResponse.json({
      needsSetup: userCount === 0,
      userCount
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao verificar setup' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se já existe algum usuário
    const existingUsers = await prisma.user.count();

    if (existingUsers > 0) {
      return NextResponse.json(
        { error: 'Setup já foi concluído. Já existem usuários no sistema.' },
        { status: 403 }
      );
    }

    const { email, name, password } = await request.json();

    // Validações
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    // Criar hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário admin
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN',
        active: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Usuário admin criado com sucesso!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Erro ao criar admin:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar usuário admin' },
      { status: 500 }
    );
  }
}
