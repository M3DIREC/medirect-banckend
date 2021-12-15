"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async distancia(ctx) {
    let citasDB = await strapi.connections.default.raw(`
      select 
      citas.id as idCita,
      instituciones.id as idInstitucion,
      instituciones.institucionNombre as institucionNombre,
      citas.citaFecha as citaFecha,
      doctor.id as idDoctor,
      doctor.username as doctorNombre,
      fileDoctor.url as doctorImagen
      from citas
      LEFT join
      instituciones
      on instituciones.id = citas.institucion
      inner join
      insituciondirecciones as direccion
      on direccion.institucion = citas.institucion
      inner join
      ${"`users-permissions_user`"} as doctor
      on doctor.id = citas.prestamista
      inner join
      upload_file_morph as imagenRegistroDoctor
      on imagenRegistroDoctor.related_id = doctor.id
      inner join
      upload_file as fileDoctor
      on imagenRegistroDoctor.upload_file_id = fileDoctor.id
      where CALCULATEDISCOORDS(${ctx.params.lat}, ${
      ctx.params.lng
    }, latitud, longitud) < ${ctx.params.km}      
      and
      citas.citaDisponible = true
      and
      imagenRegistroDoctor.related_type = 'users-permissions_user'
      and 
      citas.servicio = ${ctx.params.servicio}
      and
      citaFecha > '${ctx.params.fecha}';
    `);

    let institucionesDB = await strapi.connections.default.raw(`
     select
     instituciones.id as idInsitucion,
     insituciondirecciones.id as idDireccion,
     institucionNombre as institucion,
     direccion,
     colonia,
     ciudad,
     estado,
     latitud,
     longitud,
     upload_file.url as imagen,
     codigoPostal,
     CALCULATEDISCOORDS(${ctx.params.lat}, ${ctx.params.lng}, latitud, longitud) as distancia
     from instituciones
     inner join
     insituciondirecciones
     on instituciones.instituciondireccion = insituciondirecciones.id
     inner join
     upload_file_morph
     on upload_file_morph.related_id = instituciones.id
     inner join
     upload_file
     on upload_file_morph.upload_file_id = upload_file.id
     where CALCULATEDISCOORDS(${ctx.params.lat}, ${ctx.params.lng}, latitud, longitud) < ${ctx.params.km}
     and
     upload_file_morph.related_type = 'instituciones'
     ORDER BY distancia asc;
    `);

    let citas = citasDB[0];
    let instituciones = institucionesDB[0];
    let institucionesCitas = instituciones.map((institucion) => {
      let cita = citas.filter(
        (cita) => cita.idInstitucion === institucion.idInsitucion
      );

      institucion.citas = cita;

      return institucion;
    });

    return institucionesCitas;
  },
};
