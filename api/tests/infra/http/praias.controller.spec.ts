import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Response } from '@application/response';
import { ErrorFilter } from '@nest/error.filter';
import { PraiaController } from '@nest/_modules/praia/praia.controller';
import { PraiaService } from '@nest/_modules/praia/praia.service';

describe('PraiaController', () => {
    let app: INestApplication;
    let baseUrl: string;
    const service = {
        listar: jest.fn().mockResolvedValue({ dados: [] }),
        consultar: jest.fn().mockResolvedValue({ dados: { id: 'canasvieiras' } }),
        consultarCondicoes: jest.fn().mockResolvedValue({ dados: { periodo: 'manha' } }),
        obterRecomendacoes: jest.fn().mockResolvedValue({ dados: { recomendacoes: [] } }),
    };

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            controllers: [PraiaController],
            providers: [{ provide: PraiaService, useValue: service }],
        }).compile();
        app = module.createNestApplication();
        app.setGlobalPrefix('api/v1');
        app.useGlobalFilters(new ErrorFilter());
        app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
        await app.listen(0);
        baseUrl = await app.getUrl();
    });

    afterAll(async () => app.close());

    it.each([
        ['/api/v1/praias', 'listar', {}],
        ['/api/v1/praias/canasvieiras', 'consultar', { slug: 'canasvieiras' }],
        [
            '/api/v1/praias/canasvieiras/condicoes?data=2026-11-28&periodo=manha',
            'consultarCondicoes',
            { slug: 'canasvieiras', data: '2026-11-28', periodo: 'manha' },
        ],
        [
            '/api/v1/recomendacoes?objetivo=banho&data=2026-11-28&periodo=manha',
            'obterRecomendacoes',
            { objetivo: 'banho', data: '2026-11-28', periodo: 'manha' },
        ],
    ])('expõe GET %s com o envelope do projeto', async (path, method, input) => {
        const response = await fetch(`${baseUrl}${path}`);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual(expect.objectContaining({ statusCode: 200, message: null }));
        expect(service[method]).toHaveBeenCalledWith(input);
    });

    it('rejeita período e objetivo inválidos', async () => {
        const periodo = await fetch(`${baseUrl}/api/v1/praias/canasvieiras/condicoes?periodo=noite`);
        const objetivo = await fetch(`${baseUrl}/api/v1/recomendacoes?objetivo=pesca&periodo=dia`);

        expect(periodo.status).toBe(400);
        expect(objetivo.status).toBe(400);
        expect(service.consultarCondicoes).not.toHaveBeenCalled();
        expect(service.obterRecomendacoes).not.toHaveBeenCalled();
    });

    it('mantém o helper de envelope fora das regras de negócio', () => {
        expect(Response.success({ dados: [] })).toEqual({ data: { dados: [] }, statusCode: 200, message: null });
    });
});
