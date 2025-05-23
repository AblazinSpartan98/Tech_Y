import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getSession } from "@/app/actions/auth"

export async function GET(request: Request) {
  try {
    // Verificar sesión
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const empleados = await executeQuery("SELECT * FROM Empleado ORDER BY Nombre ASC")
    return NextResponse.json(empleados)
  } catch (error) {
    console.error("Error al obtener empleados:", error)
    return NextResponse.json({ message: "Error al obtener empleados" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Verificar sesión
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()

    // Validar datos
    if (
      !data.DNI ||
      !data.Nombre ||
      !data["Apellido Paterno"] ||
      !data["Apellido Materno"] ||
      !data.Puesto ||
      !data.Salario ||
      !data["Fecha de contratacion"] ||
      !data.Contra
    ) {
      return NextResponse.json({ message: "Datos incompletos" }, { status: 400 })
    }

    // Verificar si ya existe un empleado con ese DNI
    const existingEmpleado = await executeQuery("SELECT DNI FROM Empleado WHERE DNI = ?", [data.DNI])
    if (Array.isArray(existingEmpleado) && existingEmpleado.length > 0) {
      return NextResponse.json({ message: "Ya existe un empleado con ese DNI" }, { status: 400 })
    }

    // Insertar empleado
    await executeQuery(
      "INSERT INTO Empleado (DNI, Nombre, `Apellido Materno`, `Apellido Paterno`, Puesto, Salario, `Fecha de contratacion`, Contra) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        data.DNI,
        data.Nombre,
        data["Apellido Materno"],
        data["Apellido Paterno"],
        data.Puesto,
        data.Salario,
        data["Fecha de contratacion"],
        data.Contra,
      ],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al crear empleado:", error)
    return NextResponse.json({ message: "Error al crear empleado" }, { status: 500 })
  }
}
