'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

  async distancia(ctx) {

    let entities = await strapi.connections.default.raw(`
      select
      instituciones.id as idInsitucion,
      insituciondirecciones.id as idDireccion,
      institucionNombre as institucion,
      upload_file.url as imagen,
      citas.id as idCita,
      citas.citaFecha as fecha,
      presta.username,
      imgpre.url as imagenPrestamista,
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
      inner join
      citas
      on citas.institucion = instituciones.id
      inner join
      ${"`users-permissions_user`"} as presta
      on citas.prestamista = presta.id
      inner join
      upload_file_morph as imgpresta
      on imgpresta.related_id = presta.id
      inner join
      upload_file as imgpre
      on imgpresta.upload_file_id = imgpre.id
      where CALCULATEDISCOORDS(${ctx.params.lat}, ${ctx.params.lng}, latitud, longitud) < ${ctx.params.km}
      and
      upload_file_morph.related_type = 'instituciones'
      and
      imgpresta.related_type = 'users-permissions_user'
      and
      presta.role = 4
      ORDER BY distancia asc;
    `)

    // let entities = await strapi.connections.default.raw(`
    //  select
    //  instituciones.id as idInsitucion,
    //  insituciondirecciones.id as idDireccion,
    //  institucionNombre as institucion,
    //  direccion,
    //  colonia,
    //  ciudad,
    //  estado,
    //  latitud,
    //  longitud,
    //  upload_file.url as imagen,
    //  codigoPostal,
    //  CALCULATEDISCOORDS(${ctx.params.lat}, ${ctx.params.lng}, latitud, longitud) as distancia
    //  from instituciones
    //  inner join
    //  insituciondirecciones
    //  on instituciones.instituciondireccion = insituciondirecciones.id
    //  inner join
    //  upload_file_morph
    //  on upload_file_morph.related_id = instituciones.id
    //  inner join
    //  upload_file
    //  on upload_file_morph.upload_file_id = upload_file.id
    //  where CALCULATEDISCOORDS(${ctx.params.lat}, ${ctx.params.lng}, latitud, longitud) < ${ctx.params.km}
    //  and
    //  upload_file_morph.related_type = 'instituciones'
    //  ORDER BY distancia asc;
    //`);

    return entities[0];
  },
};
