const typeorm = require('typeorm')
const TagsModel = require('../orm/models/Tags')
const {Helpers: {floorTime}, Exceptions: {NotFound}, AbstractDB} = require('genesis-libs')

class TagsDB extends AbstractDB {

    get typeorm () {
        return typeorm
    }

    get model () {
        return TagsModel
    }

    async getTagByName (name) {
        const repository = (await this.connection()).getRepository(this.model)
        let result = await repository.findOne({
            name: name
        })
        if (!result) {
            throw new NotFound('Tag', name)
        }
        return result
    }

}

module.exports = TagsDB
