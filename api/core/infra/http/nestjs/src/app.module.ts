import { Module } from '@nestjs/common';
import { PraiaModule } from './_modules/praia/praia.module';

@Module({
    imports: [PraiaModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
