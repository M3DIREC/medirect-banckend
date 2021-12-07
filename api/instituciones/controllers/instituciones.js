"use strict";

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

    return entities[0];
  },
};
