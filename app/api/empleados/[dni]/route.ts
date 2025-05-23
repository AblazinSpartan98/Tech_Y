import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getSession } from "@/app/actions/auth"

export async function GET(request: Request, { params }: { params: { dni: string } }) {
  try {
    // Verificar sesión
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const dni = params.dni
    const empleado = await executeQuery("SELECT * FROM Empleado WHERE DNI = ?", [dni])

    if (!Array.isArray(empleado) || empleado.length === 0) {
      return NextResponse.json({ message: "Empleado no encontrado" }, { status: 404 })
    }

    return NextResponse.json(empleado[0])
  } catch (error) {
    console.error("Error al obtener empleado:", error)
    return NextResponse.json({ message: "Error al obtener empleado" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { dni: string } }) {
  try {
    // Verificar sesión
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const dni = params.dni
    const data = await request.json()

    // Validar datos
    if (
      !data.Nombre ||
      !data["Apellido Paterno"] ||
      !data["Apellido Materno"] ||
      !data.Puesto ||
      !data.Salario ||
      !data["Fecha de contratacion"]
    ) {
      return NextResponse.json({ message: "Datos incompletos" }, { status: 400 })
    }

    // Verificar si existe el empleado
    const existingEmpleado = await executeQuery("SELECT DNI FROM Empleado WHERE DNI = ?", [dni])
    if (!Array.isArray(existingEmpleado) || existingEmpleado.length === 0) {
      return NextResponse.json({ message: "Empleado no encontrado" }, { status: 404 })
    }

    // Actualizar empleado
    await executeQuery(
      "UPDATE Empleado SET Nombre = ?, `Apellido Materno` = ?, `Apellido Paterno` = ?, Puesto = ?, Salario = ?, `Fecha de contratacion` = ? WHERE DNI = ?",
      [
        data.Nombre,
        data["Apellido Materno"],
        data["Apellido Paterno"],
        data.Puesto,
        data.Salario,
        data["Fecha de contratacion"],
        dni,
      ],
    )

    // Si se proporciona una nueva contraseña, actualizarla
    if (data.Contra) {
      await executeQuery("UPDATE Empleado SET Contra = ? WHERE DNI = ?", [data.Contra, dni])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar empleado:", error)
    return NextResponse.json({ message: "Error al actualizar empleado" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { dni: string } }) {
  try {
    // Verificar sesión
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const dni = params.dni

    // Verificar si existe el empleado
    const existingEmpleado = await executeQuery("SELECT DNI FROM Empleado WHERE DNI = ?", [dni])
    if (!Array.isArray(existingEmpleado) || existingEmpleado.length === 0) {
      return NextResponse.json({ message: "Empleado no encontrado" }, { status: 404 })
    }

    // Eliminar empleado
    await executeQuery("DELETE FROM Empleado WHERE DNI = ?", [dni])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar empleado:", error)
    return NextResponse.json({ message: "Error al eliminar empleado" }, { status: 500 })
  }
}
